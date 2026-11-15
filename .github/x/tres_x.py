"""Tres Empanadas -> X, 18:00 ART.

Solo cuentan los shows en estado "activo" (confirmados, toman reservas).
Los "programados", "agotados" y "cancelados" no salen nunca.

- Cada show sale UNA vez, 2 dias antes. Si se habilito tarde (despues de la
  pasada de ayer) y es mañana o hoy, sale en la pasada siguiente.
  Si hay varios (jueves y viernes), van juntos en un solo post.
- Lunes: post casi generico ("una buena opcion para ver stand up en La Plata
  esta semana"), con las fechas confirmadas de la semana si las hay. Ese dia
  reemplaza al aviso de 2 dias antes, asi no salen dos.

Sin estado guardado: decide solo por fechas. Uso:
  python3 tres_x.py --eventos ../../data/eventos [--fecha AAAA-MM-DD]
"""
import argparse
import glob
import json
import os
from datetime import datetime, time, timedelta

from buffer_x import AR, ahora_ar, ajustar, publicar

CANAL = "6af9e12dece6dfde5fd49552"  # Tres Empanadas en Buffer
SITIO = "https://tresempanadas.com.ar"
HORA = time(18, 0)
HASHTAGS = "#StandUpLaPlata #LaPlata #QuéHacerEnLaPlata"

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

LUNES = [  # rotan por semana para no repetir texto
    "¿Plan para esta semana? Stand up en vivo en Tres Empanadas, en el centro de La Plata 🎤",
    "Si esta semana querés reírte en serio, en La Plata hay un club de comedia: Tres Empanadas 🥟🎤",
    "Stand up de verdad, cerca y sin vueltas: esta semana también hay show en Tres Empanadas 😂",
    "Esta semana, salí a ver stand up en La Plata. Te esperamos en Tres Empanadas, calle 43 🎤",
    "Comedia en vivo en La Plata: comediantes, risas y empanadas. Esta semana en Tres Empanadas 🥟",
    "¿Nunca viste stand up en vivo? Esta semana es buena para arrancar: Tres Empanadas, La Plata 🎤",
]


def cargar(carpeta):
    out = []
    for f in glob.glob(os.path.join(carpeta, "*.json")):
        try:
            ev = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        if (ev.get("estado") or "activo") == "activo" and ev.get("fecha"):
            out.append(ev)
    return sorted(out, key=lambda e: (e["fecha"], e.get("hora", "")))


def fecha(ev):
    return datetime.strptime(ev["fecha"], "%Y-%m-%d").date()


def actualizado(ev):
    try:
        return datetime.fromisoformat(ev.get("actualizado", "").replace("Z", "+00:00"))
    except ValueError:
        return None


def linea(ev, hoy):
    f = fecha(ev)
    cuando = "Hoy" if f == hoy else "Mañana" if f == hoy + timedelta(1) else DIAS[f.weekday()].capitalize()
    return f"🎤 {cuando} {f.day}/{f.month}, {ev.get('hora', '21:30')} h · {ev.get('nombre_show', '').strip()}"


def link(ev, campana):
    return f"{SITIO}/reservas/{ev['id']}/?utm_source=x&utm_medium=social&utm_campaign={campana}"


def a_publicar(eventos, hoy):
    """Shows que tocan en la pasada de hoy (sin contar el lunes)."""
    corte = datetime.combine(hoy - timedelta(1), time(17, 0), tzinfo=AR)  # pasada de ayer
    out = []
    for ev in eventos:
        d = (fecha(ev) - hoy).days
        if d == 2:
            out.append(ev)
        elif d in (0, 1):
            act = actualizado(ev)
            if act and act > corte:  # se habilito despues de la pasada de ayer
                out.append(ev)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--eventos", required=True)
    ap.add_argument("--fecha")
    a = ap.parse_args()
    hoy = datetime.strptime(a.fecha, "%Y-%m-%d").date() if a.fecha else ahora_ar().date()
    eventos = cargar(a.eventos)
    campana = f"x-{hoy.isoformat()}"

    if hoy.weekday() == 0:  # lunes
        semana = [e for e in eventos if 0 <= (fecha(e) - hoy).days <= 6]
        cabeza = LUNES[hoy.isocalendar()[1] % len(LUNES)]
        destino = link(semana[0], campana) if semana else \
            f"{SITIO}/reservas/?utm_source=x&utm_medium=social&utm_campaign={campana}"
        pie = f"Reservá tu lugar 👉 {destino}\n{HASHTAGS}"
        texto = ajustar(cabeza, [linea(e, hoy) for e in semana], pie)
    else:
        shows = a_publicar(eventos, hoy)
        if not shows:
            print("Hoy no toca post de Tres Empanadas.")
            return
        cabeza = "Se viene stand up en Tres Empanadas 🥟" if len(shows) == 1 else \
            "Doble fecha de stand up en Tres Empanadas 🥟"
        destino = link(shows[0], campana) if len(shows) == 1 else \
            f"{SITIO}/reservas/?utm_source=x&utm_medium=social&utm_campaign={campana}"
        pie = f"Reservas 👉 {destino}\n📍 Calle 43 N°1349, La Plata\n{HASHTAGS}"
        texto = ajustar(cabeza, [linea(e, hoy) for e in shows], pie)

    publicar(CANAL, texto, datetime.combine(hoy, HORA, tzinfo=AR))


if __name__ == "__main__":
    main()

#!/bin/bash
# Prueba de punta a punta contra `wrangler pages dev` (puerto 8788).
B=http://localhost:8788; J=/tmp/cj.txt; rm -f $J
H='-H Content-Type:application/json -H X-Panel:1'
echo "sin sesión ->"; curl -s $B/api/panel/estado; echo
echo "login mal ->"; curl -s -X POST $B/api/panel/login -d '{"usuario":"tres","clave":"x"}' -H 'Content-Type: application/json'; echo
echo "login ok ->"; curl -s -c $J -X POST $B/api/panel/login -d '{"usuario":"tres","clave":"clave-test"}' -H 'Content-Type: application/json'; echo
echo "csrf (sin cabecera) ->"; curl -s -b $J -X POST $B/api/panel/accion -d '{"tipo":"abrir_jornada"}' -H 'Content-Type: text/plain'; echo
echo "pedido sin jornada ->"; curl -s -X POST $B/api/pedido -H 'Content-Type: application/json' -d '{"id":"aaaaaaaa-aaaa-aaaa-aaaa-000000000001","mesa":"3","items":[{"producto_id":"agua","cantidad":1}]}'; echo
curl -s -b $J -X POST $B/api/panel/accion $H -d '{"tipo":"abrir_jornada"}' | head -c 120; echo
curl -s -b $J -X POST $B/api/panel/accion $H -d '{"tipo":"fijar_stock","producto_id":"empanada-bondiola","stock":2,"motivo":"carga"}'; echo
P='{"id":"aaaaaaaa-aaaa-aaaa-aaaa-000000000002","mesa":"3","dispositivo":"dev1","items":[{"producto_id":"empanada-bondiola","cantidad":2},{"producto_id":"ipa","cantidad":1}]}'
echo "pedido ->"; curl -s -X POST $B/api/pedido -H 'Content-Type: application/json' -d "$P" | head -c 300; echo
echo "mismo pedido de nuevo (duplicado) ->"; curl -s -X POST $B/api/pedido -H 'Content-Type: application/json' -d "$P" | head -c 60; echo
echo "otro, sin stock ->"; curl -s -X POST $B/api/pedido -H 'Content-Type: application/json' -d '{"id":"aaaaaaaa-aaaa-aaaa-aaaa-000000000003","mesa":"4","items":[{"producto_id":"empanada-bondiola","cantidad":1}]}'; echo
echo "estado cliente ->"; curl -s "$B/api/pedido?mesa=3&ids=aaaaaaaa-aaaa-aaaa-aaaa-000000000002" | head -c 80; echo
curl -s -b $J -X POST $B/api/panel/accion $H -d '{"tipo":"entregar_todo","pedido_id":"aaaaaaaa-aaaa-aaaa-aaaa-000000000002"}'; echo
echo "cuenta ->"; curl -s -b $J -X POST $B/api/panel/accion $H -d '{"tipo":"cuenta","mesa":"3"}'; echo
echo "csv ->"; curl -s -b $J $B/api/panel/csv; echo

#!/bin/sh

nginx -t
exec nginx -g 'daemon off;'

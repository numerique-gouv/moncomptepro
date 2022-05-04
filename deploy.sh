#!/bin/bash

ssh ubuntu@auth-production.infra.api.gouv.fr "sudo -H -u api-auth bash -c '/home/api-auth/deploy-server-app.sh'"

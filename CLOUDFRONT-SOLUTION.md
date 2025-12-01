# Substitua pelo IP público da sua EC2
curl -X POST http://54.233.239.101:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@amde.com","senha":"@BmXX32120#"}' \
  -v


  chmod +x check-cloudfront-config.sh
./check-cloudfront-config.sh <dtzu1m0v2dkwx.cloudfront.net>
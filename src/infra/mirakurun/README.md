# MirakTest/src/infra/mirakurun

Swagger 定義の自動生成コードをもとにした Mirakurun の API クライアントです。

## 生成方法

1. Mirakurun の Swagger 定義を入手する
   - `/api/docs` から入手できます
1. `yarn dlx @openapitools/openapi-generator-cli generate -i <Swagger 定義へのパス> -g typescript-axios -o /tmp/mirak-axios`
1. `cp /tmp/mirak-axios/api.ts src/infra/mirakurun/api.ts`
1. `yarn format:prettier`
1. 差分を調べて `index.ts` に反映します

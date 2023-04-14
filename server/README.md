# Server

## local mongodbのインストール

```shell
$ brew tap mongodb/brew
$ brew install mongodb-community
$ mongod --version   # インストールバージョン確認
```

## local mongodbのdatabase作成 

```shell
$ brew services start mongodb-community # local mongodbの起動 
$ mongosh  # local mongodbへの接続

> use test_db # データベースの作成と接続
> show dbs # 作成したデータベースの確認
> db # 接続しているデータベースの確認
```

## Apollo Serverの起動

```shell
$ npm i
$ npm run start
```


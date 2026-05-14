# Aola Star Hub 后端说明

## 本地启动

```bash
npm run server
```

默认访问地址：

```text
http://localhost:3030/aola-star.html
```

## 数据目录

用户信息：

```text
server/data/users.json
```

用户存档：

```text
server/data/saves/<用户ID>/save.json
```

其中 `<用户ID>` 来自注册时生成的用户 ID。

## 桌面应用

安装 Electron 后启动：

```bash
npm install
npm run desktop
```

Electron 会先启动同一套本地后端，再打开桌面窗口。

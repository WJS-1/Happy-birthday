# 江米知的秋日生日纪念页

手机生日纪念网站：首页 /，独立 AI 聊天 /ai。包含秋日动画、生日倒计时、本地相册和 DeepSeek 聊天。

使用 Vercel 托管。Node.js 24，无需额外依赖或构建。运行时秘密变量：DEEPSEEK_API_KEY、BIRTHDAY_ACCESS_CODE。不要把真实值提交到 GitHub。

相册和聊天记录保存在各浏览器 LocalStorage，不跨设备同步。

## GitHub Pages 版本

`docs/` 是纯静态版本：主页 `index.html`，独立聊天 `ai.html`。Pages 从 main 分支的 /docs 发布。

AI 在浏览器输入专属口令后，用 PBKDF2 + AES-GCM 解密配置并直连 DeepSeek。仓库不含明文 API 密钥或口令。口令用于解密，并非服务端身份认证；拥有口令的人可以使用或提取解锁后的 API 密钥，因此只将口令交给可信的收件人。

相册、聊天和记住的口令只保存在该设备的浏览器里，不会上传 GitHub。

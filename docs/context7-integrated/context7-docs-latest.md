# Context7 MCP - Up-to-date Code Docs For Any Prompt

[Full documentation extracted from the official Context7 repository's README.md.]

---

# Main Documentation

# Context7 MCP - Up-to-date Code Docs For Any Prompt

[![Website](https://img.shields.io/badge/Website-context7.com-blue)](https://context7.com) [![smithery badge](https://smithery.ai/badge/@upstash/context7-mcp)](https://smithery.ai/server/@upstash/context7-mcp) [<img alt="Install in VS Code (npx)" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Context7%20MCP&color=0098FF">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22context7%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40upstash%2Fcontext7-mcp%40latest%22%5D%7D)

[![繁體中文](https://img.shields.io/badge/docs-繁體中文-yellow)](./docs/README.zh-TW.md) [![簡體中文](https://img.shields.io/badge/docs-簡體中文-yellow)](./docs/README.zh-CN.md) [![日本語](https://img.shields.io/badge/docs-日本語-b7003a)](./docs/README.ja.md) [![한국어 문서](https://img.shields.io/badge/docs-한국어-green)](./docs/README.ko.md) [![Documentación en Español](https://img.shields.io/badge/docs-Español-orange)](./docs/README.es.md) [![Documentation en Français](https://img.shields.io/badge/docs-Français-blue)](./docs/README.fr.md) [![Documentação em Português (Brasil)](<https://img.shields.io/badge/docs-Português%20(Brasil)-purple>)](./docs/README.pt-BR.md) [![Documentazione in italiano](https://img.shields.io/badge/docs-Italian-red)](./docs/README.it.md) [![Dokumentasi Bahasa Indonesia](https://img.shields.io/badge/docs-Bahasa%20Indonesia-pink)](./docs/README.id-ID.md) [![Dokumentation auf Deutsch](https://img.shields.io/badge/docs-Deutsch-darkgreen)](./docs/README.de.md) [![Документация на русском языке](https://img.shields.io/badge/docs-Русский-darkblue)](./docs/README.ru.md) [![Türkçe Doküman](https://img.shields.io/badge/docs-Türkçe-blue)](./docs/README.tr.md) [![Arabic Documentation](https://img.shields.io/badge/docs-Arabic-white)](./docs/README.ar.md)

## ❌ Without Context7

LLMs rely on outdated or generic information about the libraries you use. You get:

- ❌ Code examples are outdated and based on year-old training data
- ❌ Hallucinated APIs don't even exist
- ❌ Generic answers for old package versions

## ✅ With Context7

Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.

Add `use context7` to your prompt in Cursor:

```txt
Create a basic Next.js project with app router. use context7
```

```txt
Create a script to delete the rows where the city is "" given PostgreSQL credentials. use context7
```

Context7 fetches up-to-date code examples and documentation right into your LLM's context.

- 1️⃣ Write your prompt naturally
- 2️⃣ Tell the LLM to `use context7`
- 3️⃣ Get working code answers

No tab-switching, no hallucinated APIs that don't exist, no outdated code generations.

## 📚 Adding Projects

Check out our [project addition guide](./docs/adding-projects.md) to learn how to add (or update) your favorite libraries to Context7.

## 🛠️ Installation

### Requirements

- Node.js >= v18.0.0
- Cursor, Windsurf, Claude Desktop or another MCP Client

<details>
<summary><b>Installing via Smithery</b></summary>

To install Context7 MCP Server for any client automatically via [Smithery](https://smithery.ai/server/@upstash/context7-mcp):

```bash
npx -y @smithery/cli@latest install @upstash/context7-mcp --client <CLIENT_NAME> --key <YOUR_SMITHERY_KEY>
```

You can find your Smithery key in the [Smithery.ai webpage](https://smithery.ai/server/@upstash/context7-mcp).

</details>

// ... (rest of README.md content from lines 51-712) ... 
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Octokit } from "octokit";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for multi-file generation schema
const projectSchema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: "Full path of the file including extension" },
          content: { type: Type.STRING, description: "Content of the file" },
          language: { type: Type.STRING, description: "Language for syntax highlighting (e.g., typescript, css, html)" }
        },
        required: ["path", "content", "language"]
      }
    },
    improvements: {
      type: Type.STRING,
      description: "Summary of improvements made or project features implemented"
    }
  },
  required: ["files", "improvements"]
};

// API Routes
app.post("/api/generate", async (req, res) => {
  const { prompt, model = "gemini-3.5-flash" } = req.body;
  
  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [{
            text: `Generate a complete multi-file project based on this prompt: "${prompt}". 
            Output a JSON object with a 'files' array where each item has 'path', 'content', and 'language'.
            Also include an 'improvements' field explaining what was built.`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema
      }
    });

    res.json(JSON.parse(result.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/fix-errors", async (req, res) => {
  const { files, errors } = req.body;
  
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          parts: [{
            text: `Fix the following build errors in the project files provided.
            Errors: ${JSON.stringify(errors)}
            Files: ${JSON.stringify(files)}
            
            Return the corrected files in the same JSON format as the generation endpoint.`
          }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: projectSchema
      }
    });

    res.json(JSON.parse(result.text || "{}"));
  } catch (error: any) {
    console.error("Fix Errors Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GitHub OAuth
app.get("/api/auth/github/url", (req, res) => {
  const clientID = process.env.GITHUB_CLIENT_ID;
  if (!clientID) {
    return res.status(500).json({ error: "GitHub Client ID not configured" });
  }
  const redirectUri = `${process.env.APP_URL || `http://localhost:${PORT}`}/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&scope=public_repo,repo`;
  res.json({ url });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${accessToken}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("GitHub Auth Failed");
  }
});

app.post("/api/github/create-repo", async (req, res) => {
  const { token, name, description, isPrivate, files } = req.body;
  
  try {
    const octokit = new Octokit({ auth: token });
    
    // Create repo
    const repoResponse = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init: true
    });

    const owner = repoResponse.data.owner.login;
    const repo = repoResponse.data.name;

    // Create files (simplification: commit them sequentially)
    for (const file of files) {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: file.path,
        message: `Add ${file.path}`,
        content: Buffer.from(file.content).toString('base64')
      });
    }

    res.json({ url: repoResponse.data.html_url });
  } catch (error: any) {
    console.error("GitHub Create Repo Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

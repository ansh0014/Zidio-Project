const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config()

async function testGemini() {
  console.log("🧪 Testing Gemini AI connection...")
  console.log("🔑 API Key available:", !!process.env.GEMINI_API_KEY)

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in environment variables")
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Test different models
    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]

    for (const modelName of modelsToTest) {
      try {
        console.log(`\n🔄 Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })

        const result = await model.generateContent("Hello, can you respond with 'AI is working!'?")
        const response = result.response.text()

        console.log(`✅ ${modelName} works!`)
        console.log(`📝 Response: ${response}`)
        break
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`)
      }
    }

    // List available models
    try {
      console.log("\n📋 Listing available models...")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      // Note: ListModels is not directly available in this SDK version
      console.log("ℹ️ To see available models, visit: https://ai.google.dev/models/gemini")
    } catch (error) {
      console.log("⚠️ Could not list models:", error.message)
    }
  } catch (error) {
    console.error("❌ Gemini AI test failed:", error.message)
  }
}

// Run the test
testGemini()

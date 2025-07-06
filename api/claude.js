// api/claude.js - Claude AI integration endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      success: false
    });
  }

  try {
    const { apiKey, analysisType, historicalData } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing API key',
        message: 'Anthropic API key is required'
      });
    }

    if (!historicalData) {
      return res.status(400).json({
        success: false,
        error: 'Missing data',
        message: 'Historical lottery data is required for analysis'
      });
    }

    // Test Claude API connection
    if (analysisType === 'test') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: 'Hello! Please respond with "API connection successful"'
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          success: false,
          error: 'Claude API error',
          message: errorData.error?.message || 'Failed to connect to Claude API',
          status: response.status
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        message: 'Claude API connection successful',
        model: data.model,
        usage: data.usage
      });
    }

    // For now, return a simple response
    return res.status(200).json({
      success: true,
      message: 'Claude endpoint ready',
      analysisType: analysisType,
      dataReceived: !!historicalData
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
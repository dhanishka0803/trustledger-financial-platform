#!/bin/bash

echo \"🏦 TRUSTLEDGER - Pathway Powered Financial Platform\"
echo \"=================================================\"
echo \"🚀 Starting Pathway-powered backend...\"
echo \"\"

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo \"❌ Python not found. Please install Python 3.8+\"
    exit 1
fi

# Check if required packages are installed
echo \"📦 Checking dependencies...\"
python -c "import pathway" 2>/dev/null || {
    echo \"❌ Pathway not installed. Installing dependencies...\"
    pip install -r requirements.txt
}

echo \"✅ Dependencies ready\"
echo \"\"

# Start the Pathway-powered application
echo \"🔥 Launching TRUSTLEDGER with Pathway Framework...\"
echo \"\"
echo \"Features enabled:\"
echo \"  ✅ Real-time streaming with Pathway\"
echo \"  ✅ ML fraud detection via Pathway transformers\"
echo \"  ✅ RAG-powered AI assistant\"
echo \"  ✅ Market analytics pipeline\"
echo \"  ✅ Compliance automation\"
echo \"\"
echo \"🌐 Server will be available at: http://localhost:8000\"
echo \"📚 API Documentation: http://localhost:8000/docs\"
echo \"\"

# Run the Pathway-powered main application
python main_pathway.py
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by LightGBM
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend files
COPY backend/ ./backend/

# Copy the model file from root
COPY attrition_model.pkl .

# Set working directory to backend so main.py can find feature_engineering.py etc.
WORKDIR /app/backend

# Expose port
EXPOSE 7860

# Run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

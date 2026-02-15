from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def read_root():
    with open('minimal_success.txt', 'w') as f:
        f.write('minimal server reached')
    return {"Hello": "Minimal"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)

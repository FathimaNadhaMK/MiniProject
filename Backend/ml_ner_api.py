from transformers import pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ner_pipe = pipeline("ner", model="Davlan/bert-base-multilingual-cased-ner-hrl", aggregation_strategy="simple")


@app.route("/ner", methods=["POST"])
def detect_entities():
    data = request.json
    text = data.get("text", "")
    entities = ner_pipe(text)
    locations = [e['word'] for e in entities if e['entity_group'] == "LOC"]
    people = [e['word'] for e in entities if e['entity_group'] == "PER"]
    return jsonify({ "locations": list(set(locations)), "persons": list(set(people)) })

if __name__ == "__main__":
    app.run(port=7001)

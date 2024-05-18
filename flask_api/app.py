from flask import Flask, request, jsonify
from transformers import BertTokenizer, TFBertForSequenceClassification
import tensorflow as tf

app = Flask(__name__)

# Загрузка модели и токенизатора
model = TFBertForSequenceClassification.from_pretrained('bert_resume_classifier')
tokenizer = BertTokenizer.from_pretrained('bert_resume_classifier')

def predict_resume_quality(resume_text):
    inputs = tokenizer.encode_plus(
        resume_text,
        max_length=512,
        padding='max_length',
        truncation=True,
        return_tensors='tf'
    )
    outputs = model(inputs['input_ids'], attention_mask=inputs['attention_mask'])
    prediction = tf.nn.softmax(outputs.logits, axis=-1)
    confidence = prediction.numpy()[0]
    predicted_class = tf.argmax(confidence).numpy()
    return {'confidence': confidence.tolist(), 'predicted_class': int(predicted_class)}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    resume_text = data['resume_text']
    prediction = predict_resume_quality(resume_text)
    return jsonify(prediction)

if __name__ == '__main__':
    app.run(debug=True)

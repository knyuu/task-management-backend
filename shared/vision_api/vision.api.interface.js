const q = require('q');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const OpenAI = require('openai');
class VisionApiInterface {
    constructor() {
        const projectId = process.env.PROJECTID;
        const location = process.env.LOCATION;
        const processorId = process.env.PROCESSORID;
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_LANDING_PAGE });
        this.client = new DocumentProcessorServiceClient({ credentials, projectId });
        this.name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    }

    processDocument(request) {
        let dfd = q.defer();
        this.client.processDocument(request)
            .then(([result]) => dfd.resolve(result))
            .catch(err => dfd.reject(err));
        return dfd.promise;
    }
    processDocumentWithOpenAI(base64String) {
        let dfd = q.defer();

        this.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this medical record table. Return only a JSON object with this exact structure: {headers: [Vietnamese column headers], records: [{key1: value1, ...}]}. No explanation, no markdown." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64String}`, detail: "high" } }
                    ]
                }
            ],
            max_tokens: 4000,
            temperature: 0.2
        }).then(apiResponse => {
            if (!apiResponse || !apiResponse.choices || apiResponse.choices.length === 0) {
                throw new Error('No response from OpenAI Vision API.');
            }

            const rawContent = apiResponse.choices[0].message.content;
            const jsonMatch = rawContent.match(/({[\s\S]*})/);
            if (!jsonMatch) {
                throw new Error('Failed to extract JSON from response.');
            }

            dfd.resolve(JSON.parse(jsonMatch[1].trim()));
        }).catch(err => dfd.reject(err));

        return dfd.promise;
    }
}

exports.VisionApiInterface = new VisionApiInterface();

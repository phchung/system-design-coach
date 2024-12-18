import OpenAI from "openai";
import { SYSTEM_DESIGN_INSTRUCTION, SYSTEM_DESIGN_NAME, TURBO_3_5 } from "./constants.ts";

// interface Assistant {
//     id: string;
//     object: string;
//     created_at: number;
//     name: string;
//     description: string | null;
//     model: string;
//     instructions: string;
//     tools: Tool[];
//     file_ids: string[];
//     metadata: Record<string, any>;
// }

class OpenAIClient {
    constructor(organizationKey, apiKey) {
        this.client = new OpenAI({
            organization: organizationKey,
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
        });
        this.assistant = null;
        this.createAssistant(SYSTEM_DESIGN_NAME, SYSTEM_DESIGN_INSTRUCTION, TURBO_3_5)
    }

    async createAssistant(name, instructions, model) {
        try {
            const params = {
                name: name,
                instructions: instructions,
                model: model
            };
            this.assistant = await this.client.beta.assistants.create(params);
            console.log('Assistant created:', this.assistant);
        } catch (error) {
            console.error('Error creating assistant:', error);
        }
    }

    async createThread() {
        try {
            const response = await this.client.beta.threads.create();
            const thread = response.data;
            console.log('Thread created:', thread);
            return thread;
        } catch (error) {
            console.error('Error creating thread:', error);
            return null;
        }
    }

    async addMessageToThread(threadId, role, content) {
        try {
            const message = await this.client.beta.threads.messages.create(threadId, {
                role: role,
                content: content
            });
            console.log('Message added to thread:', message);
            return message.data;
        } catch (error) {
            console.error('Error adding message to thread:', error);
            return null;
        }
    }

    async runThread(threadId, assistantId, instructions) {
        try {
            let run = await this.client.beta.threads.runs.create(threadId, {
                assistant_id: assistantId,
                instructions: instructions
            });
            console.log('Run created:', run);

            // Poll for run completion
            while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                run = await this.client.beta.threads.runs.retrieve(threadId, run.id);
            }

            // Retrieve messages
            if (run.status === 'completed') {
                const messages = await this.client.beta.threads.messages.list(threadId);
                console.log('Messages:', messages.data);
                return messages.data;
            } else {
                console.error('Run status:', run.status);
                return null;
            }
        } catch (error) {
            console.error('Error running thread:', error);
            return null;
        }
    }

    async cleanUpAssisant() {
        try {
            const response = await openai.beta.assistants.del("asst_abc123");

            console.log(response);
        } catch (error) {
            console.error('Error running clean up:', error);
            return null;
        }
    }
}

export default OpenAIClient

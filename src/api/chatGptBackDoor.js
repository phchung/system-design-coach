import OpenAI from 'openai'
import { SYSTEM_DESIGN_INSTRUCTION, SYSTEM_DESIGN_NAME, TURBO_3_5 } from './constants.ts'

CONVERSATION_API = 'https://chat.openai.com/backend-api/conversation'
COOKIE = ''

class BackDoorClient {
    constructor(organizationKey, apiKey) {
        this.client = new OpenAI({
            organization: organizationKey,
            apiKey: apiKey,
            dangerouslyAllowBrowser: true,
        })
        this.assistant = null
        this.createAssistant(SYSTEM_DESIGN_NAME, SYSTEM_DESIGN_INSTRUCTION, TURBO_3_5)
    }

    async createAssistant(name, instructions, model) {
        const result = await fetch(CONVERSATION_API, {
            headers: {
                accept: 'text/event-stream',
                'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                authorization:
                    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJwaGlsbGlwLmNodW5nMEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vYXV0aCI6eyJwb2lkIjoib3JnLVNhYUYyY2RQRzJuN1JlbjNBR09oVnJBaSIsInVzZXJfaWQiOiJ1c2VyLXFxQWJrUTlucmVNQXgzS3FEaEhJbzh1SSJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTU1MDE5MDMwMzkzNjAwNDk4NjAiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzExOTcxNjk0LCJleHAiOjE3MTI4MzU2OTQsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb3JnYW5pemF0aW9uLndyaXRlIG9mZmxpbmVfYWNjZXNzIn0.XrCSaeWCy2nnVGm48q72mI4MixJihDjBle0FfllU0dPSLuEQLJotuVeEDandQRzkNS6q0olpn0ZABlHYiZsdI214KxawvsAwopoQw0Un6Lz3_8Pip_FnAbRlO7BnUQWyUMWAcHJdz_9mYuxGakupkz-winFKdpIzuM6PN9_4X6zKpUjbf2YK41xC1v85njXqU4zYCqKRO9o3ewMIZsDYA41K-YWfp_u5GjzR3j2dK3m7SvI9gL38GjPTtyYRMcNpKMdmfa2tKnTnynN3w6xnG2SgagNz25cSRP_fTLT-W66tmncPRCKDIUD1B3dhY-O6Ct1SeMk8cFL9qyHVzxgYOQ',
                'content-type': 'application/json',
                'oai-device-id': '4cade463-3578-41dd-9ae6-03bd56743f9d',
                'oai-language': 'en-US',
                'openai-sentinel-chat-requirements-token':
                    'gAAAAABmFQpgWGWI7n-KfbjAwCGhyh5bFnbRn7zZVKKQky6pzKhJYdlF4oZPxPadvlj8Nl4xIa5MWwleUKUgKTgdH6jKnAogUhbdHoy6lkEbtseoSTVexbHU_n5MxLEzQ4ks8Fo8UngUxttlXclbqa_3mYo_OQBFSnW-j072nZ4R6hEFobDz5BeaZbaCBikAJv6Jzp3hBxeqcG2gqrfES-DhkuRM9pcxCHK5oeL3Y_rEzaYYqBH5kq7OxZEi7nGYIDqS22CZWhWFglVryLzxMZ0i7olEKTxXUA==',
                'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                cookie:
                    '',
                Referer: 'https://chat.openai.com/c/54712b57-c488-4a20-812d-282108f20e17',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
            body: '{"action":"next","messages":[{"id":"aaa2dec1-adf8-4768-bc24-7e66442575e7","author":{"role":"user"},"content":{"content_type":"text","parts":["i see thanks"]},"metadata":{}}],"conversation_id":"54712b57-c488-4a20-812d-282108f20e17","parent_message_id":"239c5470-a147-414f-9920-253c123a4951","model":"text-davinci-002-render-sha","timezone_offset_min":420,"suggestions":[],"history_and_training_disabled":false,"conversation_mode":{"kind":"primary_assistant","plugin_ids":null},"force_paragen":false,"force_paragen_model_slug":"","force_nulligen":false,"force_rate_limit":false,"websocket_request_id":"20db256c-a40c-4833-bfe1-a2aaee7e7178"}',
            method: 'POST',
        })
    }
}

export default BackDoorClient

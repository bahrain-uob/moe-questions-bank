# import os
# import asyncio
# import subprocess
# import base64
# import json
# from amazon_transcribe.client import TranscribeStreamingClient
# from amazon_transcribe.handlers import TranscriptResultStreamHandler
# from amazon_transcribe.model import TranscriptEvent

# AWS_REGION = "us-east-1"
# CHUNK_SIZE = 1024 * 8
# SAMPLE_RATE = 16000

# # Custom event handler for transcription results
# class MyEventHandler(TranscriptResultStreamHandler):
#     def __init__(self, output_stream):
#         super().__init__(output_stream)
#         self.transcripts = []

#     async def handle_transcript_event(self, transcript_event: TranscriptEvent):
#         results = transcript_event.transcript.results
#         for result in results:
#             if not result.is_partial:
#                 for alt in result.alternatives:
#                     self.transcripts.append(alt.transcript)
#                     print(f"Transcript: {alt.transcript}")

# def convert_audio_to_wav(input_file, output_file):
#     """Converts input audio file (webm) to wav format using ffmpeg."""
#     # ffmpeg should be included via a Lambda layer and accessible in PATH
#     convert_command = [
#         "/opt/ffmpeg/ffmpeg",  # Adjust path to ffmpeg binary if needed
#         "-y",
#         "-i",
#         input_file,
#         "-ar",
#         str(SAMPLE_RATE),
#         "-ac",
#         "1",
#         "-f",
#         "wav",
#         output_file,
#     ]
#     result = subprocess.run(convert_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#     if result.returncode != 0:
#         raise RuntimeError(f"ffmpeg error: {result.stderr.decode()}")

# async def transcribe_audio(file_path: str) -> str:
#     """Performs real-time transcription using Amazon Transcribe Streaming SDK."""
#     client = TranscribeStreamingClient(region=AWS_REGION)
#     full_transcript = []

#     async def audio_chunks():
#         with open(file_path, "rb") as f:
#             while True:
#                 chunk = f.read(CHUNK_SIZE)
#                 if not chunk:
#                     break
#                 yield chunk

#     async def handle_transcription_events(event_stream):
#         handler = MyEventHandler(event_stream)
#         await handler.handle_events()
#         full_transcript.extend(handler.transcripts)

#     stream = await client.start_stream_transcription(
#         language_code="en-US",
#         media_sample_rate_hz=SAMPLE_RATE,
#         media_encoding="pcm",
#     )

#     send_task = asyncio.create_task(send_audio_chunks(stream, audio_chunks()))
#     receive_task = asyncio.create_task(handle_transcription_events(stream.output_stream))

#     await asyncio.gather(send_task, receive_task)
#     return " ".join(full_transcript)

# async def send_audio_chunks(stream, audio_chunks):
#     """Streams audio chunks to Transcribe Streaming."""
#     async for chunk in audio_chunks:
#         await stream.input_stream.send_audio_event(audio_chunk=chunk)
#     await stream.input_stream.end_stream()

# def lambda_handler(event, context):
#     # Expecting event["body"] as base64-encoded binary of webm file
#     # event["isBase64Encoded"] = True
#     if "body" not in event:
#         return {
#             "statusCode": 400,
#             "body": json.dumps({"error": "No audio data provided"})
#         }

#     body = event["body"]
#     if event.get("isBase64Encoded", False):
#         audio_data = base64.b64decode(body)
#     else:
#         # If not base64 encoded, try to decode anyway
#         audio_data = base64.b64decode(body)

#     input_file = "/tmp/temp_input.webm"
#     converted_file = "/tmp/temp_converted.wav"

#     try:
#         with open(input_file, "wb") as f:
#             f.write(audio_data)

#         # Convert to wav
#         convert_audio_to_wav(input_file, converted_file)

#         # Transcribe
#         transcript_text = asyncio.run(transcribe_audio(converted_file))
#         return {
#             "statusCode": 200,
#             "body": json.dumps({"transcript": transcript_text})
#         }

#     except Exception as e:
#         return {
#             "statusCode": 500,
#             "body": json.dumps({"error": f"Processing failed: {str(e)}"})
#         }
#     finally:
#         if os.path.exists(input_file):
#             os.remove(input_file)
#         if os.path.exists(converted_file):
#             os.remove(converted_file)
import subprocess

def lambda_handler(event, context):
    try:
        # Check if ffmpeg is available
        result = subprocess.run(
            ["/opt/bin/ffmpeg", "-version"],  # Path to ffmpeg from your Lambda Layer
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # If the command runs successfully, return a success response
        if result.returncode == 0:
            return {
                "statusCode": 200,
                "body": "ffmpeg is available and functioning."
            }
        else:
            return {
                "statusCode": 500,
                "body": "ffmpeg is installed but returned an error."
            }
    except FileNotFoundError:
        # If ffmpeg binary is not found
        return {
            "statusCode": 500,
            "body": "ffmpeg is not available."
        }
    except Exception as e:
        # Catch any other exceptions and return an error response
        return {
            "statusCode": 500,
            "body": f"An unexpected error occurred: {str(e)}"
        }

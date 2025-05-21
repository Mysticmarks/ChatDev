from flask import Flask, request, jsonify
import ecdsa
import hashlib
import json # Added import for json
from camel.agents.chat_agent import ChatAgent
from camel.messages import SystemMessage, ChatMessage, UserChatMessage # Added UserChatMessage
from camel.typing import ModelType, RoleType, TaskType # Added TaskType
from camel.agents.role_playing import RolePlaying # Added RolePlaying

app = Flask(__name__)

@app.route('/api/v1/agent/invoke', methods=['POST'])
def invoke_agent():
    try:
        # Authentication
        signature_hex = request.headers.get('X-GUN-Signature')
        if not signature_hex:
            return jsonify({"error": "Missing X-GUN-Signature header"}), 401

        raw_data = request.get_data() # Get raw bytes
        try:
            data = json.loads(raw_data.decode('utf-8')) # Decode and parse JSON
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON payload"}), 400


        user_id_hex = data.get('userId')
        if not user_id_hex:
            return jsonify({"error": "Missing userId in payload"}), 400

        try:
            public_key_bytes = bytes.fromhex(user_id_hex)
            signature_bytes = bytes.fromhex(signature_hex)
            # The data to verify is the JSON stringified request body (raw_data)
            # Ensure consistent serialization if there's any modification before this point
            # For now, assuming raw_data is the exact data whose signature needs verification
            vk = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1)
            vk.verify(signature_bytes, raw_data, hashfunc=hashlib.sha256)
        except (ValueError, ecdsa.BadSignatureError) as e:
            print(f"Signature verification failed: {e}")
            return jsonify({"error": "Signature verification failed"}), 401
        except Exception as e:
            print(f"An unexpected error occurred during signature verification: {e}")
            return jsonify({"error": "An unexpected error occurred during signature verification"}), 401


        # Print received data for logging/debugging (after auth)
        print(f"Received data (post-authentication): {data}")

        agent_definition = data.get('agentDefinition')
        user_message_content = data.get('message') # Renamed from 'message' for clarity
        context = data.get('context', {}) # Default to empty dict if not present

        if not agent_definition:
            return jsonify({"error": "Missing agentDefinition"}), 400
        if not user_message_content:
            return jsonify({"error": "Missing message"}), 400

        system_prompt = agent_definition.get('system_prompt')
        role_name = agent_definition.get('role_name') # This might be used for RoleType if more specific roles are needed
        model_type_str = agent_definition.get('model_type')

        if not system_prompt:
            return jsonify({"error": "Missing system_prompt in agentDefinition"}), 400
        if not role_name: # Though not directly used in ChatAgent constructor with SystemMessage
            return jsonify({"error": "Missing role_name in agentDefinition"}), 400
        if not model_type_str:
            return jsonify({"error": "Missing model_type in agentDefinition"}), 400

        try:
            model_type_enum = getattr(ModelType, model_type_str.upper())
        except AttributeError:
            return jsonify({"error": f"Invalid model_type: {model_type_str}"}), 400

        # Agent Execution Logic
        system_message_obj = SystemMessage(role_name=role_name, content=system_prompt) # RoleType.ASSISTANT can be used if role_name mapping is complex
        
        # Using RoleType.ASSISTANT for the agent's role, role_name from definition is for the system message
        agent = ChatAgent(system_message=system_message_obj, model=model_type_enum, role_type=RoleType.ASSISTANT)
        agent.reset() # Initialize agent

        conversation_history = context.get('conversation_history', [])
        for msg_data in conversation_history:
            role_str = msg_data.get('role')
            content = msg_data.get('content')
            if role_str and content:
                # Map SPA roles to CAMEL roles
                if role_str.lower() == 'user':
                    camel_role = RoleType.USER
                elif role_str.lower() == 'assistant':
                    camel_role = RoleType.ASSISTANT
                else:
                    # Potentially skip or handle unknown roles
                    print(f"Skipping message with unknown role: {role_str}")
                    continue
                agent.memory.add_message(ChatMessage(role_name=camel_role.value, role_type=camel_role, meta_dict=None, content=content))


        user_chat_message = ChatMessage(role_name=RoleType.USER.value, role_type=RoleType.USER, meta_dict=None, content=user_message_content)
        
        agent_response = agent.step(user_chat_message)

        if not agent_response or not agent_response.msgs:
            return jsonify({"error": "Agent did not return a response"}), 500

        # Assuming the response is a single message
        reply_content = agent_response.msgs[0].content

        response_data = {
            "reply": reply_content,
            "status": "success"
        }
        return jsonify(response_data), 200

    except ecdsa.BadSignatureError: # Specific catch for clarity, though caught by generic Exception too
        print("BadSignatureError occurred.")
        return jsonify({"error": "Signature verification failed"}), 401
    except KeyError as e: # For missing keys in data or agentDefinition
        print(f"KeyError: {e}")
        return jsonify({"error": f"Missing expected field: {e}"}), 400
    except Exception as e:
        print(f"Error: {e}")
        # Log the full traceback for server-side debugging
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Invalid request or server error", "details": str(e)}), 500 # Changed to 500 for server errors

if __name__ == '__main__':
    app.run(debug=True, port=5000)


@app.route('/api/v1/agent/create_pet_task', methods=['POST'])
def create_pet_task():
    try:
        # Authentication (same as invoke_agent)
        signature_hex = request.headers.get('X-GUN-Signature')
        if not signature_hex:
            return jsonify({"error": "Missing X-GUN-Signature header"}), 401

        raw_data = request.get_data()
        try:
            data = json.loads(raw_data.decode('utf-8'))
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON payload"}), 400

        user_id_hex = data.get('userId')
        if not user_id_hex:
            return jsonify({"error": "Missing userId in payload"}), 400

        try:
            public_key_bytes = bytes.fromhex(user_id_hex)
            signature_bytes = bytes.fromhex(signature_hex)
            vk = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1)
            vk.verify(signature_bytes, raw_data, hashfunc=hashlib.sha256)
        except (ValueError, ecdsa.BadSignatureError) as e:
            print(f"Signature verification failed for create_pet_task: {e}")
            return jsonify({"error": "Signature verification failed"}), 401
        except Exception as e:
            print(f"An unexpected error occurred during signature verification for create_pet_task: {e}")
            return jsonify({"error": "An unexpected error occurred during signature verification"}), 401

        print(f"Received data for create_pet_task (post-authentication): {data}")

        parent_agent_id = data.get('parentAgentId') # Not used in current logic but good to acknowledge
        pet_definition = data.get('petDefinition')
        task_prompt_for_pet = data.get('taskPromptForPet')

        if not pet_definition:
            return jsonify({"error": "Missing petDefinition"}), 400
        if not task_prompt_for_pet:
            return jsonify({"error": "Missing taskPromptForPet"}), 400

        pet_name = pet_definition.get('name', "PetTaskAgent") # Default name if not provided
        tool_snippet = pet_definition.get('toolSnippet')

        if not tool_snippet:
            return jsonify({"error": "Missing toolSnippet in petDefinition"}), 400

        snippet_type = tool_snippet.get('type')
        if snippet_type != "prompt_llm":
            # For now, only prompt_llm is supported.
            # This can be expanded later.
            return jsonify({"error": f"Unsupported toolSnippet type: {snippet_type}. Only 'prompt_llm' is currently supported."}), 400


        pet_system_prompt = tool_snippet.get('system_prompt')
        pet_model_type_str = tool_snippet.get('model_type')

        if not pet_system_prompt:
            return jsonify({"error": "Missing system_prompt in toolSnippet"}), 400
        if not pet_model_type_str:
            return jsonify({"error": "Missing model_type in toolSnippet"}), 400

        try:
            pet_model_type_enum = getattr(ModelType, pet_model_type_str.upper())
        except AttributeError:
            return jsonify({"error": f"Invalid model_type for pet: {pet_model_type_str}"}), 400

        # Pet Agent Execution Logic
        # Use pet_name for the role_name in the SystemMessage for the pet
        pet_system_message_obj = SystemMessage(role_name=pet_name, content=pet_system_prompt)
        
        # The pet agent itself is an ASSISTANT role
        pet_agent = ChatAgent(system_message=pet_system_message_obj, model=pet_model_type_enum, role_type=RoleType.ASSISTANT)
        pet_agent.reset() # Initialize pet agent

        # Send the taskPromptForPet as the first user message to the pet
        user_chat_message_for_pet = ChatMessage(role_name=RoleType.USER.value, role_type=RoleType.USER, meta_dict=None, content=task_prompt_for_pet)
        
        pet_agent_response_obj = pet_agent.step(user_chat_message_for_pet)

        if not pet_agent_response_obj or not pet_agent_response_obj.msgs:
            return jsonify({"error": "Pet agent did not return a response"}), 500

        pet_reply_content = pet_agent_response_obj.msgs[0].content

        response_data = {
            "petId": pet_name, # Using petDefinition.name as petId for now
            "petResponse": pet_reply_content,
            "status": "success"
        }
        return jsonify(response_data), 200

    except ecdsa.BadSignatureError:
        print("BadSignatureError occurred in create_pet_task.")
        return jsonify({"error": "Signature verification failed"}), 401
    except KeyError as e:
        print(f"KeyError in create_pet_task: {e}")
        return jsonify({"error": f"Missing expected field: {e}"}), 400
    except Exception as e:
        print(f"Error in create_pet_task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Invalid request or server error in pet task creation", "details": str(e)}), 500


@app.route('/api/v1/llm/self_improve_prompt', methods=['POST'])
def self_improve_prompt():
    try:
        # Authentication (same as other endpoints)
        signature_hex = request.headers.get('X-GUN-Signature')
        if not signature_hex:
            return jsonify({"error": "Missing X-GUN-Signature header"}), 401

        raw_data = request.get_data()
        try:
            data = json.loads(raw_data.decode('utf-8'))
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON payload"}), 400

        user_id_hex = data.get('userId')
        if not user_id_hex:
            return jsonify({"error": "Missing userId in payload"}), 400

        try:
            public_key_bytes = bytes.fromhex(user_id_hex)
            signature_bytes = bytes.fromhex(signature_hex)
            vk = ecdsa.VerifyingKey.from_string(public_key_bytes, curve=ecdsa.SECP256k1)
            vk.verify(signature_bytes, raw_data, hashfunc=hashlib.sha256)
        except (ValueError, ecdsa.BadSignatureError) as e:
            print(f"Signature verification failed for self_improve_prompt: {e}")
            return jsonify({"error": "Signature verification failed"}), 401
        except Exception as e:
            print(f"An unexpected error occurred during signature verification for self_improve_prompt: {e}")
            return jsonify({"error": "An unexpected error occurred during signature verification"}), 401

        print(f"Received data for self_improve_prompt (post-authentication): {data}")

        original_prompt = data.get('prompt')
        if not original_prompt:
            return jsonify({"error": "Missing prompt in request body"}), 400

        # Logic for prompt improvement using RolePlaying
        assistant_sys_msg_content = (
            "You are a Prompt Engineer. Your task is to improve the given software idea prompt. "
            "Rewrite the prompt to be clear, effective, and concise (under 200 words) for an LLM. "
            "Ensure your final improved prompt is enclosed in <INFO> tags, like this: <INFO>your_improved_prompt_here</INFO>."
        )
        # User role can be minimal, primarily to kick off the conversation
        user_sys_msg_content = "You are a User who provides a software idea prompt to be improved."

        # Setup RolePlaying
        # Using ChatMessage for system messages as RolePlaying expects BaseMessage type
        assistant_system_message = SystemMessage(role_name="Prompt Engineer", role_type=RoleType.ASSISTANT, content=assistant_sys_msg_content)
        user_system_message = SystemMessage(role_name="User", role_type=RoleType.USER, content=user_sys_msg_content)
        
        # The task_prompt is the initial message from the user to the assistant in the role-playing scenario
        # This is slightly different from ChatChain.self_task_improve's direct task_prompt to RolePlaying constructor.
        # Here, we will make the user send the first message.
        
        # Model for the agents
        # TODO: Make model_type configurable or use a sensible default like GPT_4O_MINI if available and preferred.
        # For now, sticking to GPT_3_5_TURBO as it's generally available.
        model_type = ModelType.GPT_3_5_TURBO 

        role_playing_session = RolePlaying(
            assistant_role_name="Prompt Engineer",
            assistant_system_message=assistant_system_message,
            user_role_name="User",
            user_system_message=user_system_message,
            task_prompt=f"Improve this software idea prompt: {original_prompt}", # This task prompt is for the overall session
            model_type=model_type,
            task_type=TaskType.CODE_GENERATION, # Or TaskType.WRITING - Using a general one for now
            with_task_specify=False, # No need for additional task specification phase
            with_task_planner=False, # No task planning needed
            with_critic_in_the_loop=False, # No critic needed for this simple improvement
        )

        # The RolePlaying.step method expects a UserChatMessage as input
        # The initial message in the RolePlaying session will be from the User to the Assistant
        # However, the `task_prompt` in RolePlaying constructor usually initiates the conversation.
        # Let's trace how `chatdev.chat_chain.ChatChain.self_task_improve` does it.
        # It seems `task_prompt` is indeed the initial message from user to assistant.

        # The RolePlaying session will internally conduct the conversation.
        # The result we want is the assistant's final message.
        # `RolePlaying.step` is for a single turn. `RolePlaying.initiate_chat` might be more appropriate if we need a sequence
        # but `self_task_improve` in ChatChain seems to imply the `task_prompt` is enough to get a response.
        # Let's assume the `task_prompt` in the constructor is treated as the first user message.
        # The `RolePlaying` class, when initialized with a `task_prompt`, will have the assistant agent
        # process this task prompt. We need to get the assistant's response.

        # The `ChatChain.self_task_improve` example shows:
        # chat_turn_output = role_playing.step(UserChatMessage(content=task_prompt_self_improve))
        # This seems to imply `task_prompt_self_improve` is an *additional* message.
        # Let's adjust. The `task_prompt` in the constructor is for the *overall goal*.
        # The first actual message will be the prompt to improve.

        # Correct approach: The `task_prompt` in RolePlaying sets the context.
        # Then, the user agent in RolePlaying sends the first message (which is role_playing.task_prompt).
        # The assistant agent then responds.
        
        # The role_playing.step method is not what we need to *start* the conversation if task_prompt is set.
        # The conversation happens internally. We need to access the messages.
        # Let's try to run the session for a few turns or get the result directly.
        # `role_playing.assistant_agent.step` would be if we were driving the assistant manually.
        # `role_playing.user_agent.step` would be if we were driving the user manually.
        
        # According to `camel.agents.role_playing.RolePlaying.initiate_chat`, if task_prompt is given,
        # user_msg is created from it. Then assistant_response = self.assistant_agent.step(user_msg).
        # So, the result should be in assistant_agent's memory or returned by its step.

        # Let's try a simplified approach based on how RolePlaying is supposed to work:
        # The `task_prompt` itself will be the input to the assistant.
        # We need to get the assistant's response from its memory after the interaction.
        
        # The RolePlaying class's step method is usually for advancing the conversation one step at a time.
        # If we want the full interaction based on the initial task_prompt:
        meta_task_prompt = f"Improve this software idea prompt: {original_prompt}"

        # Re-initialize RolePlaying with this specific meta_task_prompt as the driving force
        # The task_prompt is the input to the assistant in this context.
        role_playing_session_for_improvement = RolePlaying(
            assistant_role_name="Prompt Engineer",
            assistant_system_message=assistant_system_message, # System message for the assistant
            user_role_name="User", # User role is minimal here
            user_system_message=user_system_message, # System message for the user
            task_prompt=meta_task_prompt, # This will be the input to the assistant
            model_type=model_type,
            task_type=TaskType.WRITING, # More suitable for prompt generation
            with_task_specify=False,
            with_task_planner=False,
            with_critic_in_the_loop=False,
        )
        
        # The initiate_chat method seems to run the flow and return messages
        # It returns: chat_history: List[BaseMessage], assistant_msg: BaseMessage
        # Let's try that.
        
        # The RolePlaying constructor itself doesn't run the interaction.
        # We need to call a method to start and get the result.
        # `initiate_chat` is not directly available in RolePlaying, it's part of `ChatAgent.step` typically.
        # Looking at `RolePlaying` structure, it sets up two agents.
        # The `task_prompt` is given to the user agent, who then sends it to the assistant.

        # Let's simulate the first turn:
        # 1. User agent creates a message from task_prompt.
        # 2. Assistant agent receives this message and generates a response.

        # The task_prompt given to RolePlaying's constructor is the initial utterance from the user.
        user_msg_to_assistant = UserChatMessage(role_name="User", content=meta_task_prompt) 
        
        # The assistant agent within RolePlaying will process this.
        # The RolePlaying class itself doesn't have a simple "run_and_get_assistant_reply" method.
        # We need to drive its internal agents or use a method that does.
        
        # The `step` method of `RolePlaying` is the one to use.
        # It takes an input `BaseMessage` which is the user's utterance.
        # It returns `Tuple[BaseMessage, bool, Dict[str, Any]]` -> (assistant_response, is_terminated, info)
        
        assistant_response_obj, _, _ = role_playing_session_for_improvement.step(user_msg_to_assistant)

        if not assistant_response_obj or not assistant_response_obj.content:
            return jsonify({"error": "Prompt Engineer agent did not return a response or content is empty"}), 500

        improved_prompt_raw = assistant_response_obj.content.strip()

        # Extract content within <INFO> tags
        start_tag = "<INFO>"
        end_tag = "</INFO>"
        start_index = improved_prompt_raw.find(start_tag)
        end_index = improved_prompt_raw.find(end_tag)

        if start_index != -1 and end_index != -1 and start_index < end_index:
            improved_prompt = improved_prompt_raw[start_index + len(start_tag):end_index].strip()
        else:
            # Fallback if tags are not found, use the whole response, but log a warning.
            print(f"Warning: <INFO> tags not found in assistant response. Using raw response: {improved_prompt_raw}")
            improved_prompt = improved_prompt_raw 
            # Consider returning an error or a specific status if the format is strictly required.
            # For now, we'll return the raw prompt and let the client decide.

        response_data = {
            "original_prompt": original_prompt,
            "improved_prompt": improved_prompt,
            "status": "success"
        }
        return jsonify(response_data), 200

    except ecdsa.BadSignatureError:
        print("BadSignatureError occurred in self_improve_prompt.")
        return jsonify({"error": "Signature verification failed"}), 401
    except KeyError as e:
        print(f"KeyError in self_improve_prompt: {e}")
        return jsonify({"error": f"Missing expected field: {e}"}), 400
    except Exception as e:
        print(f"Error in self_improve_prompt: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Invalid request or server error in prompt improvement", "details": str(e)}), 500

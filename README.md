# Communicative Agents for Software Development

<p align="center">
  <img src='./misc/logo1.png' width=550>
</p>

<p align="center">
    【English | <a href="readme/README-Chinese.md">Chinese</a> | <a href="readme/README-Japanese.md">Japanese</a> | <a href="readme/README-Korean.md">Korean</a> | <a href="readme/README-Filipino.md">Filipino</a> | <a href="readme/README-French.md">French</a> | <a href="readme/README-Slovak.md">Slovak</a> | <a href="readme/README-Portuguese.md">Portuguese</a> | <a href="readme/README-Spanish.md">Spanish</a> | <a href="readme/README-Dutch.md">Dutch</a> | <a href="readme/README-Turkish.md">Turkish</a> | <a href="readme/README-Hindi.md">Hindi</a> | <a href="readme/README-Bahasa-Indonesia.md">Bahasa Indonesia</a> | <a href="readme/README-Russian.md">Russian</a> | <a href="readme/README-Urdu.md">Urdu</a>】
</p>
<p align="center">
    【📚 <a href="wiki.md">Wiki</a> | 🚀 <a href="wiki.md#visualizer">Visualizer</a> | 👥 <a href="Contribution.md">Community Built Software</a> | 🔧 <a href="wiki.md#customization">Customization</a> | 👾 <a href="https://discord.gg/bn4t2Jy6TT")>Discord</a>】

</p>

## 📖 Overview

**ChatDev** has evolved! It's now an **interactive Single Page Application (SPA)** that empowers you to visually create, manage, and interact with intelligent agents and their customizable "digital pets." This new platform provides a dynamic way to explore multi-agent systems, leveraging:

-   A **React-based frontend** for a responsive user experience.
-   **Gun.js** for decentralized real-time data synchronization and user authentication.
-   **Three.js** for visualizing customizable "pets" associated with your agents.
-   A powerful **Python backend (Flask-based API)** that handles core agent logic, LLM interactions (via CAMEL AI), and complex task processing.

While retaining its core philosophy of simulating a virtual software company with various intelligent agents (CEO, CPO, CTO, Programmer, etc.), ChatDev now focuses on providing a hands-on, visual environment for:

-   **Interactive Agent Creation:** Define agent roles, system prompts, and LLM models through the UI.
-   **Pet Customization:** Design unique visual companions (pets) for your agents using parameters that control their Three.js rendering.
-   **Real-time Collaboration (Conceptual):** While direct agent-to-agent software generation is evolving, the platform supports user-to-agent chat and task delegation.
-   **Decentralized Identity:** User accounts and agent/pet data are managed via Gun.js.

The primary objective of ChatDev is to offer an **easy-to-use**, **highly visual**, and **extendable** framework for building and experimenting with LLM-powered agents and their capabilities. It serves as an ideal platform for studying human-agent interaction, agent design, and decentralized application concepts.

*(Placeholder for a new GIF/screenshot of the SPA dashboard)*
<p align="center">
  <img src='./misc/company.png' width=600> 
  *(Note: This image reflects the original ChatDev concept; new visuals for the SPA are pending.)*
</p>

## ✨ Key Features

*   **Single Page Application (SPA):** Modern, responsive interface built with React.
*   **Decentralized User Authentication:** Secure user accounts and data handling via Gun.js and SEA (Security, Encryption, Authorization).
*   **Interactive Agent Creation & Management:**
    *   Define agent names, roles/descriptions, system prompts, and select LLM models through the UI.
    *   Agents are saved and listed for each user.
*   **Customizable "Pets" for Agents:**
    *   Design visual companions (pets) for agents using configurable parameters (color, shape, size) rendered with Three.js.
    *   Pets are created and managed in the "Toolbox."
*   **Agent Interaction:**
    *   Engage in chat conversations with your created agents.
    *   Backend API (`/api/v1/agent/invoke`) processes messages and returns agent replies.
*   **Task Delegation to Pets (Conceptual):**
    *   The `/api/v1/agent/create_pet_task` endpoint allows delegating tasks to pets, which are essentially specialized agent configurations.
*   **Prompt Self-Improvement:**
    *   Utilize the `/api/v1/llm/self_improve_prompt` endpoint to refine your prompts using an LLM.
*   **Python Flask Backend:** Handles core logic, LLM communication (CAMEL AI integration), and API services.
*   **Modular Component Structure:** `AuthPage`, `DashboardComponent`, `AgentListComponent`, `AgentCreationComponent`, `AgentInteractionComponent`, `ChatViewComponent`, `ToolboxComponent`, `PetFormComponent`, `PetSpriteComponent`.

## 🎉 News
*(This section contains recent updates related to the broader ChatDev project and its research. Some features mentioned might pertain to the original command-line framework or ongoing research not yet fully integrated into the SPA.)*

**•June 25, 2024: 🎉To foster development in LLM-powered multi-agent collaboration🤖🤖 and related fields, the ChatDev team has curated a collection of seminal papers📄 presented in a [open-source](https://github.com/OpenBMB/ChatDev/tree/main/MultiAgentEbook) interactive e-book📚 format. Now you can explore the latest advancements on the [Ebook Website](https://thinkwee.top/multiagent_ebook) and download the [paper list](https://github.com/OpenBMB/ChatDev/blob/main/MultiAgentEbook/papers.csv).**
  <p align="center">
  <img src='./misc/ebook.png' width=800>
  </p>
  
•June 12, 2024: We introduced Multi-Agent Collaboration Networks (MacNet) 🎉, which utilize directed acyclic graphs to facilitate effective task-oriented collaboration among agents through linguistic interactions 🤖🤖. MacNet supports co-operation across various topologies and among more than a thousand agents without exceeding context limits. More versatile and scalable, MacNet can be considered as a more advanced version of ChatDev's chain-shaped topology. Our preprint paper is available at [https://arxiv.org/abs/2406.07155](https://arxiv.org/abs/2406.07155). This technique has been incorporated into the [macnet](https://github.com/OpenBMB/ChatDev/tree/macnet) branch, enhancing support for diverse organizational structures and offering richer solutions beyond software development (e.g., logical reasoning, data analysis, story generation, and more).
  <p align="center">
  <img src='./misc/macnet.png' width=500>
  </p>

<details>
<summary>Older News (Contextual)</summary>
*(These news items primarily relate to the original command-line version of ChatDev or research initiatives. The new SPA builds upon these concepts but offers a different user experience.)*

• May 07, 2024: Introduction of "Iterative Experience Refinement" (IER). Paper: https://arxiv.org/abs/2405.04219.
  <p align="center">
  <img src='./misc/ier.png' width=220>
  </p>

• January 25, 2024: Integration of Experiential Co-Learning Module. Original Guide: [Experiential Co-Learning Guide](wiki.md#co-tracking).

• December 28, 2023: Experiential Co-Learning preprint. Paper: https://arxiv.org/abs/2312.17025.
  <p align="center">
  <img src='./misc/ecl.png' width=860>
  </p>
• November 15, 2023: Launch of ChatDev as a SaaS platform (Note: The new SPA described here is a separate, local application). Original SaaS: https://chatdev.modelbest.cn/.
  <p align="center">
  <img src='./misc/saas.png' width=560>
  </p>

• November 2, 2023: Incremental development feature for the command-line version.
  <p align="center">
  <img src='./misc/increment.png' width=700>
  </p>

• October 26, 2023: Docker support for the command-line version. Original Guide: [Docker Start Guide](wiki.md#docker-start).
  <p align="center">
  <img src='./misc/docker.png' width=400>
  </p>
• September 25, 2023: Git mode for the command-line version. Original Guide: [guide](wiki.md#git-mode).
  <p align="center">
  <img src='./misc/github.png' width=600>
  </p>
• September 20, 2023: Human-Agent-Interaction mode for the command-line version. Original Guide: [guide](wiki.md#human-agent-interaction).
  <p align="center">
  <img src='./misc/Human_intro.png' width=600>
  </p>
• September 1, 2023: Art mode for the command-line version. Original Guide: [guide](wiki.md#art).
• August 28, 2023: Original system publicly available.
• July 16, 2023: Original [preprint paper](https://arxiv.org/abs/2307.07924) published.
</details>

## ❓ What Can ChatDev Do Now?

The new ChatDev SPA allows you to:

*   **Visually Design Agents:** Instead of command-line flags, use a graphical interface to define agent properties like system prompts, roles, and LLM models.
*   **Create Customizable "Pets":** Design unique visual companions for your agents using Three.js, defining their appearance through JSON parameters in the Toolbox.
*   **Interact with Agents:** Chat directly with your created agents, with conversations processed by the Python backend and CAMEL AI.
*   **Manage Agent and Pet Data:** User-specific data (agents, pets, credentials) is handled decentrally using Gun.js.
*   **Experiment with Prompt Engineering:** Use the self-improvement tool to refine prompts for better agent performance.
*   **Explore a Modular Frontend:** The SPA is built with React components, offering a modern user experience.

*(Placeholder for a new GIF showing SPA interaction: e.g., creating an agent, then chatting with it, then creating a pet.)*
*(The original intro.png and video are now less relevant to the SPA's direct functionality but showcase the project's heritage.)*
![original_intro](misc/intro.png)


## ⚡️ Quickstart (SPA & Backend API)

The new ChatDev consists of a Python backend API server and a frontend Single Page Application (SPA).

### 1. Backend Setup (Python API Server)

The backend server handles agent logic, LLM interactions, and serves as the brain for your agents.

1.  **Clone the GitHub Repository:**
    ```bash
    git clone https://github.com/OpenBMB/ChatDev.git
    cd ChatDev
    ```

2.  **Set Up Python Environment:** (Python 3.9+ recommended)
    ```bash
    conda create -n ChatDev_env python=3.9 -y  # Or your preferred method
    conda activate ChatDev_env
    ```

3.  **Install Dependencies:**
    The `requirements.txt` file should include `Flask`, `Flask-CORS`, `python-dotenv`, `ecdsa`, and `camel-ai` (and its dependencies like `openai`, `tiktoken`).
    ```bash
    pip3 install -r requirements.txt
    ```
    *(Ensure your `requirements.txt` is updated for `api_server.py`)*

4.  **Set Environment Variables:**
    You'll need an OpenAI API key. Create a `.env` file in the root directory of the project (or where `api_server.py` is located):
    ```env
    OPENAI_API_KEY="your_OpenAI_API_key_here"
    # Optional: Specify LLM model preferences if your API server uses them
    # OPENAI_MODEL_NAME="gpt-4o-mini" 
    ```
    The `api_server.py` will load this using `python-dotenv`.

5.  **Run the API Server:**
    Navigate to the directory containing `api_server.py` (likely the root of the project now) and run:
    ```bash
    python api_server.py
    ```
    The server will typically start on `http://localhost:5001` (or the port specified in the script). You should see output indicating it's running.

### 2. Frontend Setup (SPA - Single Page Application)

The frontend is an HTML file that uses React, Gun.js, and Three.js via CDNs.

1.  **No Build Step Required:** Since the SPA uses CDN links for its main libraries and the custom JavaScript files (`gunService.js`, `AuthPage.js`, etc.) are directly included, there's no complex build process.

2.  **Run a Gun.js Relay Peer (Recommended for Data Persistence & Multi-user/Tab Sync):**
    Gun.js works peer-to-peer in the browser, but for better data persistence across sessions/browsers and for enabling data sync if you open multiple instances, running a local relay peer is highly recommended.
    *   Install Node.js if you don't have it.
    *   Install Gun globally or locally: `npm install -g gun` (or `npm install gun` in a dedicated folder).
    *   Start a simple relay peer:
        ```bash
        gun
        ```
        This will typically start a peer on `http://localhost:8765/gun`.
    *   **Note:** The `gunService.js` in the SPA is currently initialized with `const gun = GUN();` which defaults to local storage and peer discovery. For it to reliably use your local relay, you might need to adjust it to `const gun = GUN(['http://localhost:8765/gun']);`. *This change in `gunService.js` is recommended for a stable experience.*

3.  **Open `index.html` in Your Browser:**
    *   Navigate to the directory where `index.html` is located.
    *   Simply open `index.html` directly in your web browser (e.g., by double-clicking it or using `File > Open` in your browser).
    *   Ensure that all associated JavaScript files (`App.js`, `AuthPage.js`, `DashboardComponent.js`, `AgentCreationComponent.js`, `AgentListComponent.js`, `AgentInteractionComponent.js`, `ChatViewComponent.js`, `ToolboxComponent.js`, `PetFormComponent.js`, `PetSpriteComponent.js`, and `gunService.js`) are in the same directory as `index.html`, or update the script paths in `index.html` if they are organized into subdirectories.

4.  **Interact with the SPA:**
    *   You should see the login/register page. Create an account (this is handled by Gun.js).
    *   Once logged in, you can create agents, customize pets in the toolbox, and chat with your agents.
    *   Ensure the Python API server is running for agent interactions.

### 🐳 Quickstart with Docker

*(Placeholder: Docker instructions need to be updated to reflect the new SPA + API server architecture. This would involve a Docker Compose setup to run both the Python API server and a Gun.js relay peer, and serve the static frontend files.)*

For now, please follow the manual setup instructions above.

## ✨️ Advanced Skills & Customization

The new ChatDev SPA offers several avenues for customization:

*   **Agent Behavior:** Modify agent system prompts, roles, and LLM models directly through the UI to tailor their expertise and responses.
*   **Pet Appearance:** Experiment with different `spriteParams` (color, shape, size) in the Toolbox to create unique visual pets for your agents.
*   **Frontend Components:** The React-based frontend is modular. Developers can extend or modify existing components (`ChatViewComponent`, `AgentCreationComponent`, etc.) or add new ones. *(Refer to `App.js` and individual component files for structure)*.
*   **Backend API:** The Python Flask server (`api_server.py`) can be extended with new endpoints to add more complex agent capabilities or tools.
*   **Gun.js Data Schema:** Advanced users can explore and extend the data schemas used for agents and pets within Gun.js. *(Refer to `AgentCreationComponent.js` and `PetFormComponent.js` for current schemas)*.

*(Placeholder: Link to a future Wiki section on SPA Customization and Development Guide. The existing Wiki primarily covers the command-line tool.)*
The existing [Wiki](wiki.md) provides extensive details on the original ChatDev framework, some concepts of which may still be relevant for understanding agent roles and behaviors.

## 🤗 Share Your Creations

With the new ChatDev SPA, you can share:

*   **Agent Designs:** The definitions of your agents (system prompts, roles, chosen models). You can share these as text or JSON.
*   **Pet Parameters:** The JSON `spriteParams` and `toolSnippet.config` for your unique pets.
*   **Screenshots/Videos:** Show off your interactive sessions and unique agent-pet combinations!

We encourage you to share your innovative agent designs and pet creations with the community!

*(The "Code", "Company", and "Software" sub-sections from the original README are less directly applicable to the SPA's current functionality but the spirit of open contribution remains.)*

**See community contributed software and ideas [here](Contribution.md)!** (This link might need updating to a new page for SPA creations).

## 👨‍💻‍ Contributors

<a href="https://github.com/OpenBMB/ChatDev/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=OpenBMB/ChatDev" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## 🔎 Citation

```
@article{chatdev,
    title = {ChatDev: Communicative Agents for Software Development},
    author = {Chen Qian and Wei Liu and Hongzhang Liu and Nuo Chen and Yufan Dang and Jiahao Li and Cheng Yang and Weize Chen and Yusheng Su and Xin Cong and Juyuan Xu and Dahai Li and Zhiyuan Liu and Maosong Sun},
    journal = {arXiv preprint arXiv:2307.07924},
    url = {https://arxiv.org/abs/2307.07924},
    year = {2023}
}

@article{colearning,
    title = {Experiential Co-Learning of Software-Developing Agents},
    author = {Chen Qian and Yufan Dang and Jiahao Li and Wei Liu and Zihao Xie and Yifei Wang and Weize Chen and Cheng Yang and Xin Cong and Xiaoyin Che and Zhiyuan Liu and Maosong Sun},
    journal = {arXiv preprint arXiv:2312.17025},
    url = {https://arxiv.org/abs/2312.17025},
    year = {2023}
}

@article{macnet,
    title={Scaling Large-Language-Model-based Multi-Agent Collaboration},
    author={Chen Qian and Zihao Xie and Yifei Wang and Wei Liu and Yufan Dang and Zhuoyun Du and Weize Chen and Cheng Yang and Zhiyuan Liu and Maosong Sun}
    journal={arXiv preprint arXiv:2406.07155},
    url = {https://arxiv.org/abs/2406.07155},
    year={2024}
}

@article{iagents,
    title={Autonomous Agents for Collaborative Task under Information Asymmetry},
    author={Wei Liu and Chenxi Wang and Yifei Wang and Zihao Xie and Rennai Qiu and Yufan Dnag and Zhuoyun Du and Weize Chen and Cheng Yang and Chen Qian},
    journal={arXiv preprint arXiv:2406.14928},
    url = {https://arxiv.org/abs/2406.14928},
    year={2024}
}
```
More research from our lab can be accessed [here](https://thinkwee.top/multiagent_ebook/#more-works).

## ⚖️ License

- Source Code Licensing: Our project's source code is licensed under the Apache 2.0 License. This license permits the use, modification, and distribution of the code, subject to certain conditions outlined in the Apache 2.0 License.
- Data Licensing: The related data utilized in our project is licensed under CC BY-NC 4.0. This license explicitly permits non-commercial use of the data. We would like to emphasize that any models trained using these datasets should strictly adhere to the non-commercial usage restriction and should be employed exclusively for research purposes.


## 🤝 Acknowledgments

<a href="http://nlp.csai.tsinghua.edu.cn/"><img src="misc/thunlp.png" height=50pt></a>&nbsp;&nbsp;
<a href="https://modelbest.cn/"><img src="misc/modelbest.png" height=50pt></a>&nbsp;&nbsp;
<a href="https://github.com/OpenBMB/AgentVerse/"><img src="misc/agentverse.png" height=50pt></a>&nbsp;&nbsp;
<a href="https://github.com/OpenBMB/RepoAgent"><img src="misc/repoagent.png"  height=50pt></a>
<a href="https://app.commanddash.io/agent?github=https://github.com/OpenBMB/ChatDev"><img src="misc/CommandDash.png" height=50pt></a>

## 📬 Contact

If you have any questions, feedback, or would like to get in touch, please feel free to reach out to us via email at [qianc62@gmail.com](mailto:qianc62@gmail.com)

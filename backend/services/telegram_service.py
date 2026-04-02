"""
Telegram Service: Send notifications via Telegram Bot.

Input: Message text, chat ID
Output: Success/failure status
"""

from typing import Dict, Any
import requests
import os


class TelegramService:
    def __init__(self, bot_token: str = None, chat_id: str = None):
        """
        Initialize with bot token and chat ID (dependency injection).

        Args:
            bot_token: Telegram Bot API token (from .env if not provided)
            chat_id: Default chat ID for sending messages (from .env if not provided)
        """
        self.bot_token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"

    def send_message(
        self, text: str, chat_id: str = None, parse_mode: str = "HTML"
    ) -> Dict[str, Any]:
        chat_id = chat_id or self.chat_id

        if not chat_id:
            return {"success": False, "error": "No chat_id provided"}

        try:
            response = requests.post(
                f"{self.base_url}/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
                timeout=10,
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "message_id": data.get("result", {}).get("message_id"),
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_photo(
        self, photo_url: str, caption: str = "", chat_id: str = None
    ) -> Dict[str, Any]:
        chat_id = chat_id or self.chat_id

        if not chat_id:
            return {"success": False, "error": "No chat_id provided"}

        try:
            response = requests.post(
                f"{self.base_url}/sendPhoto",
                json={"chat_id": chat_id, "photo": photo_url, "caption": caption},
                timeout=10,
            )

            if response.status_code == 200:
                return {"success": True}
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                }

        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_me(self) -> Dict[str, Any]:
        try:
            response = requests.get(f"{self.base_url}/getMe", timeout=10)

            if response.status_code == 200:
                return {"success": True, "bot": response.json().get("result")}
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                }

        except Exception as e:
            return {"success": False, "error": str(e)}

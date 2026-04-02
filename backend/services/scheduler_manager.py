"""
Scheduler Manager: Schedule periodic tasks for scraping and analysis.

Responsibility: Schedule stock/news fetching and send notifications via Telegram
"""

from datetime import datetime
from typing import List, Callable, Any, Dict
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

# ===== SCHEDULE CONFIGURATION (Taiwan Time) =====
SCHEDULE_CONFIG = {
    # Stock price updates
    "stock_open": {"hour": 22, "minute": 30},      # Market open (EST 09:30)
    "stock_intraday": {"hour": 1, "minute": 0},    # Intraday (EST 12:00)
    "stock_close": {"hour": 5, "minute": 0},       # Market close (EST 16:00)
    # News updates
    "news_before_open": {"hour": 21, "minute": 30},  # 1 hour before open
    "news_intraday": {"hour": 1, "minute": 0},       # Intraday
    "news_after_close": {"hour": 6, "minute": 0},    # 1 hour after close
    # Analysis
    "analysis_after_close": {"hour": 6, "minute": 5},  # 5 min after news
}


class SchedulerManager:
    """Manage scheduled tasks for stock monitoring."""

    def __init__(self):
        """Initialize APScheduler."""
        # Use Taiwan timezone
        self.timezone = pytz.timezone("Asia/Taipei")
        self.scheduler = BackgroundScheduler(timezone=self.timezone)
        self.jobs = []

    def schedule_stock_price_updates(
        self, callback: Callable, symbols: List[str]
    ) -> None:
        # Open: 22:30 (previous day EST 09:30)
        config = SCHEDULE_CONFIG["stock_open"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["open", symbols],
            id="stock_open_update",
            name="Stock Open Price Update",
            replace_existing=True,
        )
        self.jobs.append("stock_open_update")

        # Intraday: 01:00 (next day EST 12:00)
        config = SCHEDULE_CONFIG["stock_intraday"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["intraday", symbols],
            id="stock_intraday_update",
            name="Stock Intraday Update",
            replace_existing=True,
        )
        self.jobs.append("stock_intraday_update")

        # Close: 05:00 (next day EST 16:00)
        config = SCHEDULE_CONFIG["stock_close"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["close", symbols],
            id="stock_close_update",
            name="Stock Close Price Update",
            replace_existing=True,
        )
        self.jobs.append("stock_close_update")

    def schedule_news_updates(
        self, callback: Callable, symbols: List[str]
    ) -> None:
        # Before open: 21:30 (previous day, 1 hour before EST 09:30)
        config = SCHEDULE_CONFIG["news_before_open"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["before_open", symbols],
            id="news_before_open",
            name="News Before Open",
            replace_existing=True,
        )
        self.jobs.append("news_before_open")

        # Intraday: 01:00 (same as stock intraday)
        config = SCHEDULE_CONFIG["news_intraday"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["intraday", symbols],
            id="news_intraday",
            name="News Intraday",
            replace_existing=True,
        )
        self.jobs.append("news_intraday")

        # After close: 06:00 (next day, 1 hour after EST 16:00)
        config = SCHEDULE_CONFIG["news_after_close"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=["after_close", symbols],
            id="news_after_close",
            name="News After Close",
            replace_existing=True,
        )
        self.jobs.append("news_after_close")

    def schedule_analysis_job(
        self, callback: Callable, symbols: List[str]
    ) -> None:
        # After close (1 hour after EST 16:00)
        config = SCHEDULE_CONFIG["analysis_after_close"]
        self.scheduler.add_job(
            callback,
            CronTrigger(hour=config["hour"], minute=config["minute"]),
            args=[symbols],
            id="analysis_after_close",
            name="Analysis After Close",
            replace_existing=True,
        )
        self.jobs.append("analysis_after_close")

    def start(self) -> None:
        """Start the scheduler."""
        if not self.scheduler.running:
            self.scheduler.start()
            print(f"✅ Scheduler started at {datetime.now(self.timezone)}")

    def stop(self) -> None:
        """Stop the scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("⏹️  Scheduler stopped")

    def get_jobs(self) -> List[Dict[str, Any]]:
        """Get list of scheduled jobs."""
        jobs_list = []
        for job in self.scheduler.get_jobs():
            # Start scheduler if not running to get next_run_time
            if not self.scheduler.running:
                self.scheduler.start()

            jobs_list.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": getattr(job, "next_run_time", "Not calculated"),
                "trigger": str(job.trigger),
            })
        return jobs_list

    def print_schedule(self) -> None:
        """Print all scheduled jobs."""
        print("\n" + "=" * 70)
        print("📅 Scheduled Jobs (Taiwan Time)")
        print("=" * 70)

        jobs = self.get_jobs()
        if not jobs:
            print("No jobs scheduled")
            return

        for job in jobs:
            print(f"\n🔔 {job['name']}")
            print(f"   ID: {job['id']}")
            print(f"   Trigger: {job['trigger']}")
            print(f"   Next Run: {job['next_run_time']}")

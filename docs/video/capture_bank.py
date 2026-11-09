"""Capture the automatic bank-trigger flow into docs/pitch/bank-*.jpg (Playwright, mobile size).
Usage: python docs/video/capture_bank.py <password_file> [base_url]
"""

import sys, os, re
from playwright.sync_api import sync_playwright

PW = open(sys.argv[1], encoding="utf-8").read().strip()
BASE = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3006"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pitch")


def login(ctx, email):
    p = ctx.new_page()
    p.goto(BASE + "/login")
    p.fill("#email", email)
    p.fill("#pw", PW)
    p.locator("form button").last.click()
    p.wait_for_url(re.compile(r"/(parent|guardian)"), timeout=30000)
    p.wait_for_timeout(1500)
    return p


def snap(p, name, full=False):
    p.screenshot(path=os.path.join(OUT, name), type="jpeg", quality=90, full_page=full)
    print("saved", name)


with sync_playwright() as pw:
    b = pw.chromium.launch()
    opts = dict(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2,
        is_mobile=True,
        has_touch=True,
        locale="ko-KR",
    )
    mom = login(b.new_context(**opts), "mom@scamshield.test")
    joon = login(b.new_context(**opts), "joon@scamshield.test")

    mom.get_by_role("button", name="검찰이 시킨 '안전계좌' 이체").click()
    mom.get_by_text("내 은행 앱").scroll_into_view_if_needed()
    snap(mom, "bank-01-mom-transfer.jpg")
    mom.get_by_role("button", name=re.compile("이체하기")).click()
    mom.wait_for_timeout(700)
    snap(mom, "bank-02-mom-checking.jpg")
    mom.get_by_text(re.compile("보류")).first.wait_for(timeout=60000)
    mom.wait_for_timeout(1500)
    mom.get_by_text(re.compile("보류")).first.scroll_into_view_if_needed()
    snap(mom, "bank-03-mom-held.jpg")

    joon.get_by_role("button", name=re.compile("Block transfer")).first.wait_for(
        timeout=30000
    )
    joon.wait_for_timeout(800)
    snap(joon, "bank-04-joon-alert.jpg")
    joon.get_by_role(
        "button", name=re.compile("Block transfer")
    ).first.scroll_into_view_if_needed()
    snap(joon, "bank-05-joon-block.jpg")
    joon.get_by_role("button", name=re.compile("Block transfer")).first.click()

    mom.get_by_text(re.compile("막았어요")).first.wait_for(timeout=30000)
    mom.wait_for_timeout(1000)
    mom.get_by_text(re.compile("막았어요")).first.scroll_into_view_if_needed()
    snap(mom, "bank-06-mom-blocked.jpg")

    joon.wait_for_timeout(1000)
    link = joon.get_by_role(
        "link", name=re.compile("agent decided|warning record", re.I)
    ).first
    link.click()
    joon.wait_for_url(re.compile("/checks/"), timeout=20000)
    joon.wait_for_timeout(1500)
    joon.get_by_text(re.compile("assess_transfer")).first.scroll_into_view_if_needed()
    snap(joon, "bank-07-trace.jpg")
    snap(joon, "bank-07b-trace-full.jpg", full=True)

    mom.get_by_role("button", name="아들에게 용돈 보내기").click()
    mom.get_by_role("button", name=re.compile("이체하기")).click()
    mom.wait_for_timeout(12000)
    mom.get_by_text("내 은행 앱").scroll_into_view_if_needed()
    snap(mom, "bank-08-mom-safe.jpg", full=True)
    b.close()

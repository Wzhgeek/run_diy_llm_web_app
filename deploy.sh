sudo bash -c 'cat > /etc/systemd/system/diy_llm_web_app.service <<EOF
[Unit]
Description=DIY LLM Web Application
After=network.target

[Service]
User=root
WorkingDirectory=/srv/run_diy_llm_web_app
ExecStart=/usr/bin/python3 /srv/run_diy_llm_web_app/run.py
Restart=always
RestartSec=5s
StandardOutput=syslog
StandardError=syslog
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOF'

```bash

backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_chat.py
│   │   ├── routes_memos.py
│   │   └── routes_auth.py
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   ├── intent_classifier.py
│   │   └── tools/
│   │       ├── __init__.py
│   │       ├── market_tool.py
│   │       ├── ratios_tool.py
│   │       ├── comparison_tool.py
│   │       ├── memo_tool.py
│   │       └── rag_tool.py
│   │
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── ingest.py
│   │   └── vector_store.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py
│   │   └── db_models.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── crud.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   └── rbac.py
│   │
│   └── services/
│       ├── __init__.py
│       └── memo_service.py
│
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md

```
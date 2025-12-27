import logging
from logging import Logger
from functools import lru_cache

_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

@lru_cache(maxsize=64)
def get_logger(name: str) -> Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(_FORMAT)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger

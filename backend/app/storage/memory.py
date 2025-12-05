memory_store = {}

def get_user_memory(user_id: str):
    return memory_store.get(user_id, [])

def save_to_memory(user_id: str, data: str):
    if user_id not in memory_store:
        memory_store[user_id] = []
    memory_store[user_id].append(data)
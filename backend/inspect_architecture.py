import torch
import os
import sys

def inspect_model():
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'advanced_skin_disease_model.pth'))
    print(f"Inspecting model at: {model_path}", flush=True)
    
    try:
        checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
        state_dict = checkpoint['model_state_dict'] if 'model_state_dict' in checkpoint else checkpoint
        
        keys = list(state_dict.keys())
        print(f"Total keys: {len(keys)}", flush=True)
        print("First 10 keys:", flush=True)
        for k in keys[:10]:
            print(f"  {k}", flush=True)
            
    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    inspect_model()

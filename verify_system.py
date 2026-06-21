import requests
import subprocess
import os
import sys

def check(label, condition, fix_hint):
    status = "PASS" if condition else "FAIL"
    icon   = "✅" if condition else "❌"
    print(f"  {icon} {label}: {status}")
    if not condition:
        print(f"     FIX: {fix_hint}")
    return condition

print("=" * 50)
print("  NEUROBRIGHT SYSTEM VERIFICATION")
print("=" * 50)

project_root = os.path.dirname(os.path.abspath(__file__))
ml_service   = os.path.join(project_root, "ml-service")

print("\n[FILES]")
check("best_model.pkl exists",
    os.path.exists(os.path.join(ml_service, "artifacts/best_model.pkl")),
    "cd ml-service && python run_pipeline.py")

check("label_encoder.pkl exists",
    os.path.exists(os.path.join(ml_service, "data/final/label_encoder.pkl")),
    "cd ml-service && python run_pipeline.py")

check("serial_bridge.py exists",
    os.path.exists(os.path.join(ml_service, "serial_bridge.py")),
    "Check ml-service folder")

check("Firmware platformio.ini exists",
    os.path.exists(os.path.join(project_root, "NeuroBright_Firmware/platformio.ini")),
    "Recreate NeuroBright_Firmware folder")

print("\n[SERVICES]")
for port, name in [(8000, "FastAPI ML"), (5000, "Node Backend"), (5173, "React Frontend")]:
    try:
        r = requests.get(f"http://localhost:{port}", timeout=2)
        check(f"{name} on :{port}", True, "")
    except:
        check(f"{name} on :{port}", False, 
              f"Start the {name} service first")

print("\n[ML SERVICE HEALTH]")
try:
    r = requests.get("http://localhost:8000/health", timeout=3)
    data = r.json()
    check("model_loaded = true",
          data.get("model_loaded", False),
          "cd ml-service && python run_pipeline.py first")
except:
    print("  ⚠️  Cannot reach FastAPI — start with: cd ml-service && python main.py")

print("\n[ARDUINO]")
try:
    import serial.tools.list_ports
    ports = list(serial.tools.list_ports.comports())
    arduino_ports = [p for p in ports if "UNO" in p.description or "Arduino" in p.description]
    check("Arduino detected",
          len(arduino_ports) > 0,
          "Plug in Arduino UNO R4 and upload firmware via VSCode PlatformIO")
    if arduino_ports:
        print(f"     Found: {arduino_ports[0].device} — {arduino_ports[0].description}")
except ImportError:
    print("  ⚠️  pyserial not installed: pip install pyserial")

print("\n" + "=" * 50)
print("Run 'python start_all.py' to start everything")
print("=" * 50)

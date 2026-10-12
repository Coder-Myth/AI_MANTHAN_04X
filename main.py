"""
TerraAI Prototype — Main Entrypoint & Working CLI Runner
=========================================================
Demonstrates the single-function Carbon Calculator prototype.
Provides:
  - Automated demo of MSME activity footprint calculation
  - Smart bill parsing demonstration
  - What-If ROI financial scenario calculation
  - Built-in test suite (`python main.py --test`)
  - Interactive CLI input mode (`python main.py --interactive`)
  - Built-in HTTP server to run the browser UI (`python main.py --serve [port]`)
"""

import sys
import os
import json
import argparse
from http.server import HTTPServer, SimpleHTTPRequestHandler

from prototype_core import calculate_carbon_footprint


def run_demo():
    print("=" * 72)
    print("  TerraAI Carbon Intelligence — Single Function Working Prototype")
    print("=" * 72)
    print("Standards: CEA India FY 2024-25 v21.0 | DEFRA MSME | GHG Protocol")
    print("-" * 72)

    sample_msme = {
        "business": {
            "name": "Tata Ancillary Supplier Unit",
            "industry": "Precision Engineering & Auto Components",
            "city": "Pithampur Industrial Area, Madhya Pradesh",
            "reportingPeriod": "FY 2025-26"
        },
        "electricity": {
            "amount": 12500,
            "unit": "kWh",
            "period": "Monthly"
        },
        "fuels": [
            {
                "type": "Diesel",
                "quantity": 450,
                "unit": "Litres",
                "period": "Monthly"
            }
        ],
        "transport": {
            "distance_km": 3200,
            "vehicle_type": "Light Commercial Vehicle",
            "period": "Monthly"
        },
        "materials": [
            {
                "type": "Steel",
                "quantity": 4000,
                "unit": "kg",
                "period": "Monthly"
            }
        ],
        "waste": [
            {
                "type": "General Landfill Waste",
                "quantity": 250,
                "unit": "kg",
                "period": "Monthly"
            }
        ],
        "whatIf": {
            "category": "Electricity",
            "reductionPct": 25
        }
    }

    result = calculate_carbon_footprint(sample_msme)
    fp = result["footprint"]
    biz = result["business"]

    print(f"\n[SCENARIO 1] Structured MSME Telemetry Assessment:")
    print(f"Facility: {biz['name']} ({biz['city']})")
    print(f"\n>> TOTAL ANNUAL CARBON FOOTPRINT: {fp['total_tco2e']:.3f} tCO2e")
    print("-" * 50)
    print(f"  * Scope 1 (Direct Fuels):            {fp['scope1_tco2e']:.2f} tCO2e")
    print(f"  * Scope 2 (Grid Electricity):       {fp['scope2_tco2e']:.2f} tCO2e")
    print(f"  * Scope 3 (Value Chain/Logistics):  {fp['scope3_tco2e']:.2f} tCO2e")
    print("-" * 50)

    print("\n>> REAL DOMAIN BREAKDOWN (100% User Telemetry):")
    for d in result["domains"]:
        bars = "#" * int(d["percentage"] / 3)
        print(f"  {d['domain']:<14} : {d['emissions_tco2e']:>8.2f} tCO2e ({d['percentage']:>5.1f}%) | {bars}")

    wi = result["what_if_simulation"]
    print("\n>> WHAT-IF ROI SCENARIO:")
    print(f"  Target: {wi['reduction_pct']}% reduction in {wi['category']}")
    print(f"  CO2 Abated:             {wi['co2_saved_tco2e']:.2f} tCO2e/year")
    print(f"  Projected Cost Savings: INR {wi['projected_annual_saving_inr']:,.2f} / year")
    print(f"  Estimated CAPEX:        INR {wi['estimated_capex_inr']:,.2f}")
    print(f"  Estimated Payback:      {wi['payback_years']} years")

    print("\n" + "=" * 72)
    print("[SCENARIO 2] Smart Bill OCR & Text Auto-Classifier (Single Function):")
    bill_sample = "MPPKVVCL Madhya Pradesh Electricity Discom Bill. Shopfloor units consumed: 12,000 kWh for spinning looms."
    bill_res = calculate_carbon_footprint(bill_sample)["analysis"]
    print(f"Input Statement: \"{bill_sample}\"")
    print(f"  Detected Domain:    {bill_res['detected_domain']} ({bill_res['scope']})")
    print(f"  Extracted Quantity: {bill_res['quantity']} {bill_res['unit']}")
    print(f"  Statutory Factor:   {bill_res['statutory_factor']} kg CO2e/{bill_res['unit']}")
    print(f"  Calculated Footprint: {bill_res['emissions_tco2e']} tCO2e")
    print("=" * 72 + "\n")


def run_tests():
    print("[TEST SUITE] Verifying single function mathematical correctness...")
    # Test 1: Electricity
    res1 = calculate_carbon_footprint({"electricity": {"amount": 1000, "unit": "kWh", "period": "Annual"}})
    expected_s2 = (1000 * 0.7100) / 1000.0
    assert abs(res1["footprint"]["scope2_tco2e"] - expected_s2) < 1e-4, "Electricity calculation mismatch"
    print("  [PASS] Test 1: Scope 2 Electricity calculation verified.")

    # Test 2: Diesel fuel
    res2 = calculate_carbon_footprint({"fuels": [{"type": "Diesel", "quantity": 100, "unit": "Litres", "period": "Annual"}]})
    expected_s1 = (100 * 2.6870) / 1000.0
    assert abs(res2["footprint"]["scope1_tco2e"] - expected_s1) < 1e-4, "Diesel fuel calculation mismatch"
    print("  [PASS] Test 2: Scope 1 Diesel fuel calculation verified.")

    # Test 3: Smart Bill NLP pattern recognition
    res3 = calculate_carbon_footprint("HPCL Diesel bill 500 Litres for factory generator")
    assert res3["analysis"]["detected_domain"] == "Fuel", "Domain classification mismatch"
    assert res3["analysis"]["quantity"] == 500.0, "Quantity extraction mismatch"
    print("  [PASS] Test 3: Smart Bill NLP pattern recognition verified.")

    # Test 4: Financial What-If ROI scenario
    res4 = calculate_carbon_footprint({
        "electricity": {"amount": 10000, "unit": "kWh", "period": "Annual"},
        "whatIf": {"category": "Electricity", "reductionPct": 20}
    })
    assert res4["what_if_simulation"]["co2_saved_tco2e"] > 0, "ROI calculation error"
    print("  [PASS] Test 4: Financial What-If ROI scenario verified.")

    print("\n>> ALL 4 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% Deterministic)\n")


def run_server(port=8080):
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(curr_dir)
    server_address = ("", port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"\n==================================================================")
    print(f"  TerraAI Standalone Web Prototype Server")
    print(f"  Serving at: http://127.0.0.1:{port}/index.html")
    print(f"  Press Ctrl+C to terminate the server.")
    print(f"==================================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


def run_interactive():
    print("\n--- TerraAI Interactive Carbon Footprint Calculator ---")
    biz_name = input("Enter Enterprise Name [My MSME Unit]: ") or "My MSME Unit"
    elec_kwh = float(input("Enter Monthly Electricity in kWh [e.g. 10000]: ") or "10000")
    diesel_l = float(input("Enter Monthly Diesel in Litres [e.g. 300]: ") or "300")
    dist_km = float(input("Enter Monthly Logistics Freight in km [e.g. 2000]: ") or "2000")

    payload = {
        "business": {"name": biz_name},
        "electricity": {"amount": elec_kwh, "unit": "kWh", "period": "Monthly"},
        "fuels": [{"type": "Diesel", "quantity": diesel_l, "unit": "Litres", "period": "Monthly"}],
        "transport": {"distance_km": dist_km, "vehicle_type": "Light Commercial Vehicle", "period": "Monthly"}
    }
    res = calculate_carbon_footprint(payload)
    print(f"\n>> Results for {biz_name}:")
    print(f"Total Footprint: {res['footprint']['total_tco2e']:.2f} tCO2e/year")
    print(f"Scope 1 (Diesel):     {res['footprint']['scope1_tco2e']:.2f} tCO2e")
    print(f"Scope 2 (Electricity):{res['footprint']['scope2_tco2e']:.2f} tCO2e")
    print(f"Scope 3 (Logistics):  {res['footprint']['scope3_tco2e']:.2f} tCO2e\n")


def main():
    parser = argparse.ArgumentParser(description="TerraAI Single Function Prototype Runner")
    parser.add_argument("--test", action="store_true", help="Run automated test suite")
    parser.add_argument("--interactive", action="store_true", help="Interactive terminal mode")
    parser.add_argument("--serve", type=int, nargs="?", const=8080, help="Launch prototype web server on port (default 8080)")
    args = parser.parse_args()

    if args.test:
        run_tests()
    elif args.interactive:
        run_interactive()
    elif args.serve is not None:
        run_server(args.serve)
    else:
        run_demo()


if __name__ == "__main__":
    main()

"""
NetworkX Multi-Hop Mule Graph & Fan-Out Smurfing Engine for PRATYAKSH.
Traces fund dispersion, layering velocity, fan-out sub-accounts, and identifies active cash-out nodes.
"""
import networkx as nx
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple


# Pre-seeded bank directories for realistic Indian banking rails
INDIAN_BANKS = [
    {"bank": "State Bank of India", "ifsc_prefix": "SBIN000"},
    {"bank": "HDFC Bank", "ifsc_prefix": "HDFC000"},
    {"bank": "ICICI Bank", "ifsc_prefix": "ICIC000"},
    {"bank": "Axis Bank", "ifsc_prefix": "UTIB000"},
    {"bank": "Bank of Baroda", "ifsc_prefix": "BARB000"},
    {"bank": "Punjab National Bank", "ifsc_prefix": "PUNB000"},
    {"bank": "Kotak Mahindra Bank", "ifsc_prefix": "KKBK000"},
    {"bank": "Canara Bank", "ifsc_prefix": "CNRB000"},
]

FIRST_NAMES = ["Amit", "Rahul", "Pooja", "Vikas", "Sunita", "Deepak", "Rohan", "Priya", "Manish", "Kavita", "Sanjay", "Anil"]
LAST_NAMES = ["Sharma", "Patel", "Kulkarni", "Verma", "Deshmukh", "Singh", "Yadav", "Jadhav", "Gupta", "Chavan"]


class MuleGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()

    @staticmethod
    def _generate_account(bank_info: Dict[str, str], seed_val: str) -> Dict[str, str]:
        hasher = hashlib.md5(seed_val.encode()).hexdigest()
        acc_num = f"{int(hasher[:10], 16) % 9000000000 + 1000000000}"
        ifsc = f"{bank_info['ifsc_prefix']}{int(hasher[10:14], 16) % 900 + 100}"
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        return {
            "account_no": acc_num,
            "bank": bank_info["bank"],
            "ifsc": ifsc,
            "holder_name": name,
        }

    def generate_mule_trail(
        self,
        case_id: str,
        victim_name: str,
        amount: float,
        fraud_type: str,
        center_lat: float,
        center_lon: float,
        start_time: datetime = None,
    ) -> Dict[str, Any]:
        """
        Builds a multi-hop money mule propagation graph with fan-out smurfing if amount > 2,00,000.
        Returns serialized graph data with nodes, edges, layers, summary metrics, and active cashout node coordinates.
        """
        if start_time is None:
            start_time = datetime.now() - timedelta(minutes=45)

        G = nx.DiGraph()
        nodes = []
        edges = []

        # 1. Victim Node (Layer 0)
        victim_id = f"VICTIM_{case_id}"
        victim_bank = INDIAN_BANKS[0]
        victim_acc = self._generate_account(victim_bank, f"{case_id}_victim")
        
        victim_node_data = {
            "id": victim_id,
            "label": f"Victim: {victim_name}",
            "type": "VICTIM",
            "layer": 0,
            "holder_name": victim_name,
            "bank": victim_acc["bank"],
            "account_no": victim_acc["account_no"],
            "ifsc": victim_acc["ifsc"],
            "amount": amount,
            "lat": round(center_lat - 0.005, 6),
            "lon": round(center_lon - 0.004, 6),
            "timestamp": start_time.isoformat(),
            "status": "COMPLAINED_1930",
            "risk_score": 0.0,
            "is_frozen": False,
        }
        G.add_node(victim_id, **victim_node_data)
        nodes.append(victim_node_data)

        # 2. Layer 1 Mule (Primary Ingestion Mule Account)
        l1_time = start_time + timedelta(minutes=random.randint(4, 9))
        l1_id = f"MULE_L1_{case_id}"
        l1_bank = INDIAN_BANKS[1]
        l1_acc = self._generate_account(l1_bank, f"{case_id}_l1")
        l1_lat = round(center_lat + random.uniform(-0.002, 0.002), 6)
        l1_lon = round(center_lon + random.uniform(-0.002, 0.002), 6)
        
        l1_node_data = {
            "id": l1_id,
            "label": f"L1 Mule: {l1_acc['holder_name']}",
            "type": "MULE_L1",
            "layer": 1,
            "holder_name": l1_acc["holder_name"],
            "bank": l1_acc["bank"],
            "account_no": l1_acc["account_no"],
            "ifsc": l1_acc["ifsc"],
            "amount": amount,
            "lat": l1_lat,
            "lon": l1_lon,
            "ip_address": f"103.{random.randint(10, 250)}.{random.randint(1, 250)}.{random.randint(1, 250)}",
            "timestamp": l1_time.isoformat(),
            "status": "FUNDS_DIVERTED",
            "risk_score": 0.88,
            "is_frozen": False,
        }
        G.add_node(l1_id, **l1_node_data)
        nodes.append(l1_node_data)

        # Edge Victim -> L1
        edge_v_l1 = {
            "source": victim_id,
            "target": l1_id,
            "amount": amount,
            "channel": "IMPS" if amount < 500000 else "RTGS",
            "txn_id": f"TXN_{hashlib.md5((case_id + '_l1').encode()).hexdigest()[:12].upper()}",
            "timestamp": l1_time.isoformat(),
            "latency_mins": round((l1_time - start_time).total_seconds() / 60.0, 1),
        }
        G.add_edge(victim_id, l1_id, **edge_v_l1)
        edges.append(edge_v_l1)

        # 3. Layer 2 / Layer 3 (Fan-Out Smurfing Logic)
        active_cashout_nodes = []
        is_fan_out = amount > 200000.0

        if is_fan_out:
            # Split amount into 3 to 6 sub-mule accounts of ~₹40k-₹50k
            num_smurfs = min(6, max(3, int(amount // 50000)))
            remaining = amount
            amounts_list = []
            for i in range(num_smurfs - 1):
                chunk = round(amount / num_smurfs + random.uniform(-4000, 4000), 2)
                chunk = min(chunk, remaining - 10000)
                amounts_list.append(chunk)
                remaining -= chunk
            amounts_list.append(round(remaining, 2))

            for idx, smurf_amt in enumerate(amounts_list, start=1):
                l2_time = l1_time + timedelta(minutes=random.randint(3, 8) + idx)
                l2_id = f"MULE_L2_SMURF_{idx}_{case_id}"
                l2_bank = INDIAN_BANKS[(idx + 2) % len(INDIAN_BANKS)]
                l2_acc = self._generate_account(l2_bank, f"{case_id}_l2_{idx}")
                
                # Proximity offsets for cell-tower / ATM corridor
                l2_lat = round(center_lat + random.uniform(-0.006, 0.006), 6)
                l2_lon = round(center_lon + random.uniform(-0.006, 0.006), 6)

                l2_node_data = {
                    "id": l2_id,
                    "label": f"L2 Smurf #{idx}: {l2_acc['holder_name']}",
                    "type": "MULE_L2_SMURF",
                    "layer": 2,
                    "holder_name": l2_acc["holder_name"],
                    "bank": l2_acc["bank"],
                    "account_no": l2_acc["account_no"],
                    "ifsc": l2_acc["ifsc"],
                    "amount": smurf_amt,
                    "lat": l2_lat,
                    "lon": l2_lon,
                    "ip_address": f"49.{random.randint(10, 250)}.{random.randint(1, 250)}.{random.randint(1, 250)}",
                    "timestamp": l2_time.isoformat(),
                    "status": "CASHOUT_IN_PROGRESS" if idx == 1 else "DISPERSED",
                    "risk_score": 0.94 if idx == 1 else 0.85,
                    "is_frozen": False,
                }
                G.add_node(l2_id, **l2_node_data)
                nodes.append(l2_node_data)

                # Edge L1 -> L2
                edge_l1_l2 = {
                    "source": l1_id,
                    "target": l2_id,
                    "amount": smurf_amt,
                    "channel": "UPI_P2P" if smurf_amt <= 100000 else "IMPS",
                    "txn_id": f"TXN_{hashlib.md5((case_id + f'_l2_{idx}').encode()).hexdigest()[:12].upper()}",
                    "timestamp": l2_time.isoformat(),
                    "latency_mins": round((l2_time - l1_time).total_seconds() / 60.0, 1),
                }
                G.add_edge(l1_id, l2_id, **edge_l1_l2)
                edges.append(edge_l1_l2)

                active_cashout_nodes.append(l2_node_data)
        else:
            # Single Layer 2 Mule Node
            l2_time = l1_time + timedelta(minutes=random.randint(4, 10))
            l2_id = f"MULE_L2_DIRECT_{case_id}"
            l2_bank = INDIAN_BANKS[3]
            l2_acc = self._generate_account(l2_bank, f"{case_id}_l2_direct")
            l2_lat = round(center_lat + random.uniform(-0.003, 0.003), 6)
            l2_lon = round(center_lon + random.uniform(-0.003, 0.003), 6)

            l2_node_data = {
                "id": l2_id,
                "label": f"L2 Mule: {l2_acc['holder_name']}",
                "type": "MULE_L2",
                "layer": 2,
                "holder_name": l2_acc["holder_name"],
                "bank": l2_acc["bank"],
                "account_no": l2_acc["account_no"],
                "ifsc": l2_acc["ifsc"],
                "amount": amount,
                "lat": l2_lat,
                "lon": l2_lon,
                "ip_address": f"49.{random.randint(10, 250)}.{random.randint(1, 250)}.{random.randint(1, 250)}",
                "timestamp": l2_time.isoformat(),
                "status": "CASHOUT_IN_PROGRESS",
                "risk_score": 0.92,
                "is_frozen": False,
            }
            G.add_node(l2_id, **l2_node_data)
            nodes.append(l2_node_data)

            edge_l1_l2 = {
                "source": l1_id,
                "target": l2_id,
                "amount": amount,
                "channel": "IMPS",
                "txn_id": f"TXN_{hashlib.md5((case_id + '_l2').encode()).hexdigest()[:12].upper()}",
                "timestamp": l2_time.isoformat(),
                "latency_mins": round((l2_time - l1_time).total_seconds() / 60.0, 1),
            }
            G.add_edge(l1_id, l2_id, **edge_l1_l2)
            edges.append(edge_l1_l2)

            active_cashout_nodes.append(l2_node_data)

        # Extract primary active vector coordinates
        primary_mule = active_cashout_nodes[0]

        return {
            "case_id": case_id,
            "fraud_type": fraud_type,
            "total_amount": amount,
            "is_fan_out_smurfing": is_fan_out,
            "hop_count": 2 if not is_fan_out else 2,
            "num_nodes": len(nodes),
            "num_edges": len(edges),
            "nodes": nodes,
            "edges": edges,
            "active_cashout_node": primary_mule,
            "primary_mule_lat": primary_mule["lat"],
            "primary_mule_lon": primary_mule["lon"],
            "primary_mule_account": primary_mule["account_no"],
            "primary_mule_bank": primary_mule["bank"],
            "primary_mule_holder": primary_mule["holder_name"],
        }

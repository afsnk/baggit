import { useNavigate } from "@tanstack/react-router";
import BuySellPanel from "../components/trading/BuySellPanel";

export default function Sell() {
  const navigate = useNavigate();

  return (
    <BuySellPanel
      mode="sell"
      onClose={() => navigate({ to: "/" })}
    />
  );
}

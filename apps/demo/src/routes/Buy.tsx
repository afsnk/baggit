import { useNavigate } from "@tanstack/react-router";
import BuySellPanel from "../components/trading/BuySellPanel";

export default function Buy() {
  const navigate = useNavigate();

  return (
    <BuySellPanel
      mode="buy"
      onClose={() => navigate({ to: "/" })}
    />
  );
}

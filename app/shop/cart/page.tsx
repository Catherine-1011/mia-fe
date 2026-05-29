// This route has moved to /cart
import { redirect } from "next/navigation";

export default function OldCartRedirect() {
  redirect("/cart");
}

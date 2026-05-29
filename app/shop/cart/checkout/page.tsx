// This route has moved to /checkout
import { redirect } from "next/navigation";

export default function OldCheckoutRedirect() {
  redirect("/checkout");
}

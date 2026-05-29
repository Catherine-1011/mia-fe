  "use client";
  import { Trash2 } from "lucide-react";

  type CartItemProps = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    stock?: number;
    onUpdate: (id: number, change: number) => void;
    onRemove: (id: number) => void;
    imageUrl?: string;
  };

  export default function CartItem({
    id,
    name,
    price,
    quantity,
    stock,
    onUpdate,
    onRemove,
    imageUrl , // default image fallback
  }: CartItemProps) {
    const subtotal = price * quantity;

    return (
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center py-4 border-b border-black/20 px-4">

        {/* Product */}
        <div className="flex gap-4 items-center">
          <img
            src={imageUrl}
            alt={name}
            className="h-20 w-20 rounded-lg object-cover"
          />
          <h3 className="font-medium text-lg">{name}</h3>
        </div>

        {/* Quantity */}
        <div className="flex justify-center">
          <div className="bg-white flex items-center gap-4 px-4 py-2 rounded-full border">
            <button
              className="text-lg font-bold hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
              onClick={() => onUpdate(id, -1)}
              disabled={quantity <= 1}
            >
              −
            </button>

            <span className="text-base font-medium min-w-7.5 text-center">
              {quantity}
            </span>

            <button
              className="text-lg font-bold hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => onUpdate(id, 1)}
              disabled={stock != null ? quantity >= stock : false}
            >
              +
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="text-center font-medium text-base">
          ${price.toFixed(2)}
        </div>

        {/* Subtotal */}
        <div className="text-center font-medium text-base">
          ${subtotal.toFixed(2)}
        </div>

        {/* Delete (RIGHTMOST) */}
        <div className="flex justify-end">
          <button
            onClick={() => onRemove(id)}
            className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
            aria-label={`Remove ${name} from cart`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }
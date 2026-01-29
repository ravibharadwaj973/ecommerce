// app/admin/products/[id]/variants/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useApi } from "../../../../hooks/useApi";
import {
  ArrowLeft,
  Plus,
  X,
  Package,
  Tag,
  DollarSign,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

type Attribute = {
  _id: string;
  name: string;
  values: {
    _id: string;
    value: string;
  }[];
};

type Product = {
  _id: string;
  name: string;
  skuPrefix?: string;
};
interface AttributeValue {
  _id: string;
  value: string;
  attribute: {
    _id: string;
    name: string;
    slug: string;
  };
}
interface GroupedAttribute {
  _id: string;
  name: string;
  values: Array<{
    _id: string;
    value: string;
  }>;
}
export default function CreateVariantsPage() {
  const { id: productId } = useParams();
  const router = useRouter();

  const {
    data: product,
    loading: productLoading,
    fetchData: fetchProduct,
  } = useApi<Product>();
  const {
    data: attributesRaw,
    loading: attributesLoading,
    fetchData: fetchAttributes,
  } = useApi<Attribute[]>();
  const attributeValues = Array.isArray(attributesRaw) ? attributesRaw : [];

 const attributes = Object.values(
  ((attributeValues || []) as any[]).reduce(
    (acc: Record<string, GroupedAttribute>, item: any) => {
      const attrId = item.attribute?._id;

      if (!attrId) return acc; // Safety check

      if (!acc[attrId]) {
        acc[attrId] = {
          _id: attrId,
          name: item.attribute.name,
          values: [],
        };
      }

      acc[attrId].values.push({
        _id: item._id,
        value: item.value,
      });

      return acc;
    }, 
    {} as Record<string, GroupedAttribute> // Explicitly type the initial value
  )
);

  const { loading: creating, postData: createVariant } = useApi();

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [tempSelected, setTempSelected] = useState<Record<string, string>>({});
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);
  const [step, setStep] = useState(1); // 1: Attributes, 2: Details, 3: Review

  useEffect(() => {
    if (productId) {
      fetchProduct(`/api/newproducts/${productId}`);
      fetchAttributes("/api/newproducts/attribute-values");
    }
  }, [productId]);

  // Generate SKU prefix from product name
  useEffect(() => {
    if (product?.name && !sku) {
      const prefix = product.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);
      setSku(prefix);
    }
  }, [product]);

  const addAttributeValue = (attributeId: string) => {
    const valueId = tempSelected[attributeId];
    if (!valueId) return;

    setSelected((prev) => {
      const existing = prev[attributeId] || [];
      if (existing.includes(valueId)) return prev;

      const updated = {
        ...prev,
        [attributeId]: [...existing, valueId],
      };

      // Auto-generate variant previews
      generateVariantPreviews(updated);

      return updated;
    });

    setTempSelected((prev) => ({
      ...prev,
      [attributeId]: "",
    }));
  };

  const removeAttributeValue = (attributeId: string, valueId: string) => {
    setSelected((prev) => {
      const updated = {
        ...prev,
        [attributeId]: prev[attributeId].filter((v) => v !== valueId),
      };

      generateVariantPreviews(updated);
      return updated;
    });
  };

  const generateVariantPreviews = (selectedAttrs: Record<string, string[]>) => {
    const entries = Object.entries(selectedAttrs);
    if (entries.length === 0) {
      setGeneratedVariants([]);
      return;
    }

    // Generate all combinations
    const combine = (index: number, current: any[]): any[] => {
      if (index === entries.length) return [current];
      const [attributeId, values] = entries[index];
      let result: any[] = [];

      for (const valueId of values) {
        const attribute = attributes.find((a) => a._id === attributeId);
        const value = (attribute?.values || []).find((v) => v._id === valueId);

        if (attribute && value) {
          result = result.concat(
            combine(index + 1, [
              ...current,
              {
                attribute: attributeId,
                attributeName: attribute.name,
                value: valueId,
                valueName: value.value,
              },
            ]),
          );
        }
      }
      return result;
    };

    const combinations = combine(0, []);
    setGeneratedVariants(combinations);
    if (combinations.length > 0 && step === 1) {
      setStep(2); // Auto-advance to details step when variants are generated
    }
  };

  const createAllVariants = async () => {
    if (!productId || !sku.trim() || !price || !stock) {
      toast.error("SKU, price and stock are required");
      return;
    }

    if (generatedVariants.length === 0) {
      toast.error("Select at least one attribute value");
      return;
    }

    const variantsToCreate = generatedVariants.map((combination, index) => ({
      product: productId,
      sku: `${sku}-${index + 1}`,
      price: Number(price),
      stock: Number(stock),
      isActive,
      attributes: combination.map((item: any) => ({
        attribute: item.attribute,
        value: item.value,
      })),
    }));

    try {
      // Create variants sequentially
      for (let i = 0; i < variantsToCreate.length; i++) {
        const variant = variantsToCreate[i];
        const result = await createVariant(
          "/api/newproducts/variants",
          variant,
        );

        if (!result) {
          throw new Error(`Failed to create variant ${variant.sku}`);
        }
      }

      toast.success(
        `${variantsToCreate.length} variants created successfully!`,
      );
      router.push(`/admin/products/${productId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create variants");
    }
  };
  console.log(attributes);
  const totalVariants = generatedVariants.length;
  const totalStock = Number(stock) * totalVariants;
  const totalValue = Number(price) * totalStock;

  return (
    <div title="Create Variants">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Variants
              </h1>
              {product && (
                <p className="text-gray-600 mt-1">
                  For product:{" "}
                  <span className="font-medium">{product.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step === stepNumber
                        ? "bg-blue-600 text-white"
                        : step > stepNumber
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-medium ${
                        step >= stepNumber ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {stepNumber === 1 && "Select Attributes"}
                      {stepNumber === 2 && "Enter Details"}
                      {stepNumber === 3 && "Review & Create"}
                    </div>
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`ml-6 w-12 h-0.5 ${
                        step > stepNumber ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Select Attribute Values
                </h2>

                {attributesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-500">Loading attributes...</p>
                  </div>
                ) : attributes && attributes.length > 0 ? (
                  <div className="space-y-6">
                    {attributes.map((attr) => (
                      <div key={attr._id} className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {attr.name}
                        </label>

                        <div className="flex gap-2">
                          <select
                            value={tempSelected[attr._id] || ""}
                            onChange={(e) =>
                              setTempSelected((p) => ({
                                ...p,
                                [attr._id]: e.target.value,
                              }))
                            }
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                          >
                            <option value="">Select {attr.name}</option>

                            {(attr.values || []).map((v) => (
                              <option key={v._id} value={v._id}>
                                {v.value}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => addAttributeValue(attr._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selected values */}
                        {(selected[attr._id] || []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(selected[attr._id] || []).map((vId) => {
                              const val = (attr.values || []).find(
                                (v) => v._id === vId,
                              );
                              return (
                                <span
                                  key={vId}
                                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                                >
                                  {val?.value}
                                  <button
                                    onClick={() =>
                                      removeAttributeValue(attr._id, vId)
                                    }
                                    className="text-blue-900 hover:text-blue-950"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setStep(2)}
                        disabled={generatedVariants.length === 0}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Details ({totalVariants} variants will be
                        created)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No Attributes Available
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You need to create attributes before adding variants.
                    </p>
                    <button
                      onClick={() => router.push("/admin/attributes")}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Attributes
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Enter Variant Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU Prefix *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        placeholder="e.g., TSHIRT"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">-001, -002, etc.</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalVariants} variants will be created with SKUs: {sku}
                      -001 through {sku}-
                      {totalVariants.toString().padStart(3, "0")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Variant (₹) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock per Variant *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="0"
                          min="0"
                          className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Make all variants active immediately
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Review & Create Variants
                </h2>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-800 mb-4">Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Variants</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {totalVariants}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Stock</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {totalStock}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Price per Variant
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{price}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{totalValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Variant Previews */}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">
                      Variant Previews
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {generatedVariants
                        .slice(0, 10)
                        .map((combination, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {sku}-
                                  {(index + 1).toString().padStart(3, "0")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {combination
                                    .map(
                                      (item: any) =>
                                        `${item.attributeName}: ${item.valueName}`,
                                    )
                                    .join(", ")}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{price}</p>
                                <p className="text-sm text-gray-600">
                                  Stock: {stock}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {generatedVariants.length > 10 && (
                        <p className="text-center text-gray-500 text-sm">
                          ... and {generatedVariants.length - 10} more variants
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={createAllVariants}
                      disabled={creating}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating
                        ? "Creating..."
                        : `Create ${totalVariants} Variants`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Product Info */}
            {product && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Product Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Product Name</p>
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </div>
                  {product.skuPrefix && (
                    <div>
                      <p className="text-sm text-gray-600">SKU Prefix</p>
                      <p className="font-medium text-gray-900">
                        {product.skuPrefix}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Attributes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Selected Attributes
              </h3>

              {Object.keys(selected).length === 0 ? (
                <p className="text-gray-500 text-sm">No attributes selected</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(selected).map(([attrId, valueIds]) => {
                    const attribute = attributes?.find((a) => a._id === attrId);
                    if (!attribute) return null;

                    return (
                      <div key={attrId}>
                        <p className="font-medium text-gray-700 text-sm mb-2">
                          {attribute.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {valueIds.map((vId) => {
                            const value = (attribute.values || []).find(
                              (v) => v._id === vId,
                            );
                            return value ? (
                              <span
                                key={vId}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {value.value}
                                <button
                                  onClick={() =>
                                    removeAttributeValue(attrId, vId)
                                  }
                                  className="text-blue-900 hover:text-blue-950"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Statistics Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Variant Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Total Combinations</span>
                  <span className="text-2xl font-bold text-blue-900">
                    {totalVariants}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Total Stock</span>
                  <span className="text-xl font-semibold text-blue-900">
                    {totalStock}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Total Value</span>
                  <span className="text-xl font-semibold text-blue-900">
                    ₹{totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

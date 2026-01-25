// app/admin/attributes/page.tsx
'use client';

import { useState, useEffect } from 'react';
 
import { useApi } from '../../hooks/useApi';
import { Plus, Edit2, Trash2, Check, X, Search, Filter, Tag } from 'lucide-react';
import { toast } from 'sonner';

type Attribute = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  values: AttributeValue[];
  valueCount?: number;
  createdAt: string;
};

type AttributeValue = {
  _id: string;
  value: string;
  slug: string;
  isActive: boolean;
  attribute?: {
    _id: string;
    name: string;
  };
};

export default function AttributesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit' | 'view'>('view');
  const [editAttribute, setEditAttribute] = useState<Partial<Attribute>>({});
  const [editValue, setEditValue] = useState<Partial<AttributeValue>>({});

  const { 
    data: attributes, 
    loading: attributesLoading, 
    error: attributesError,
    fetchData: fetchAttributes,
    postData: createAttribute,
    putData: updateAttribute,
    deleteData: deleteAttribute 
  } = useApi<Attribute[]>();

  const { 
    data: attributeValues,
    loading: valuesLoading,
    fetchData: fetchValues,
    postData: createValue,
    putData: updateValue,
    deleteData: deleteValue 
  } = useApi<AttributeValue[]>();

  // Fetch attributes on mount
  useEffect(() => {
    fetchAttributes('/api/newproducts/attributes');
  }, []);

  // Fetch values when attribute is selected
  useEffect(() => {
    if (selectedAttribute) {
      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute._id}`);
    }
  }, [selectedAttribute]);

  const handleCreateAttribute = async () => {
    if (!editAttribute.name?.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    const result = await createAttribute('/api/newproducts/attributes', {
      name: editAttribute.name,
      isActive: editAttribute.isActive ?? true,
    });

    if (result) {
      setEditMode('view');
      setEditAttribute({});
      fetchAttributes('/api/newproducts/attributes');
      toast.success('Attribute created successfully');
    }
  };

  const handleUpdateAttribute = async () => {
    if (!editAttribute._id || !editAttribute.name?.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    const result = await updateAttribute(`/api/newproducts/attributes/${editAttribute._id}`, {
      name: editAttribute.name,
      isActive: editAttribute.isActive,
    });

    if (result) {
      setEditMode('view');
      setEditAttribute({});
      fetchAttributes('/api/newproducts/attributes');
      
      // If this was the selected attribute, update it
      if (selectedAttribute?._id === editAttribute._id) {
        setSelectedAttribute(result.data);
      }
      
      toast.success('Attribute updated successfully');
    }
  };

  const handleDeleteAttribute = async (attribute: Attribute) => {
    if (!confirm(`Delete attribute "${attribute.name}"? This will also delete all its values.`)) {
      return;
    }

    const result = await deleteAttribute(`/api/newproducts/attributes/${attribute._id}`);
    if (result) {
      fetchAttributes('/api/newproducts/attributes');
      if (selectedAttribute?._id === attribute._id) {
        setSelectedAttribute(null);
      }
      toast.success('Attribute deleted successfully');
    }
  };

  const handleCreateValue = async () => {
    if (!selectedAttribute || !editValue.value?.trim()) {
      toast.error('Select attribute and enter value');
      return;
    }

    const result = await createValue('/api/newproducts/attribute-values', {
      attribute: selectedAttribute._id,
      value: editValue.value,
      isActive: editValue.isActive ?? true,
    });

    if (result) {
      setEditValue({});
      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute._id}`);
      toast.success('Value added successfully');
    }
  };

  const handleUpdateValue = async () => {
    if (!editValue._id || !editValue.value?.trim()) {
      toast.error('Value is required');
      return;
    }

    const result = await updateValue(`/api/newproducts/attribute-values/${editValue._id}`, {
      value: editValue.value,
      isActive: editValue.isActive,
    });

    if (result) {
      setEditValue({});
      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute?._id}`);
      toast.success('Value updated successfully');
    }
  };

  const handleDeleteValue = async (value: AttributeValue) => {
    if (!confirm(`Delete value "${value.value}"?`)) {
      return;
    }

    const result = await deleteValue(`/api/newproducts/attribute-values/${value._id}`);
    if (result) {
      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute?._id}`);
      toast.success('Value deleted successfully');
    }
  };

  const attributesList = Array.isArray(attributes) ? attributes : [];

const filteredAttributes = attributesList.filter(attr => {
  const matchesSearch =
    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attr.slug.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesActive =
    filterActive === 'all' ||
    (filterActive === 'active' && attr.isActive) ||
    (filterActive === 'inactive' && !attr.isActive);

  return matchesSearch && matchesActive;
});


  const startEditAttribute = (attribute?: Attribute) => {
    if (attribute) {
      setEditAttribute(attribute);
      setEditMode('edit');
    } else {
      setEditAttribute({ name: '', isActive: true });
      setEditMode('create');
    }
  };

  const startEditValue = (value?: AttributeValue) => {
    if (value) {
      setEditValue(value);
    } else {
      setEditValue({ value: '', isActive: true });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Attributes List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Attributes
              </h3>
              <button
                onClick={() => startEditAttribute()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search attributes..."
                  className="w-full text-black pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'active', 'inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterActive(status as any)}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      filterActive === status
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Create/Edit Attribute Form */}
          {(editMode === 'create' || editMode === 'edit') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode === 'create' ? 'Create New Attribute' : 'Edit Attribute'}
                </h3>
                <button
                  onClick={() => {
                    setEditMode('view');
                    setEditAttribute({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attribute Name *
                  </label>
                  <input
                    type="text"
                    value={editAttribute.name || ''}
                    onChange={(e) => setEditAttribute(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Color, Size, Material"
                    className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editAttribute.isActive ?? true}
                    onChange={(e) => setEditAttribute(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-black text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditMode('view');
                      setEditAttribute({});
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editMode === 'create' ? handleCreateAttribute : handleUpdateAttribute}
                    disabled={attributesLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attributesLoading ? 'Saving...' : editMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attributes List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {attributesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500 text-sm">Loading attributes...</p>
              </div>
            ) : attributesError ? (
              <div className="p-6 text-center">
                <p className="text-red-600">Error: {attributesError}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAttributes?.map((attr) => (
                  <div
                    key={attr._id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedAttribute?._id === attr._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedAttribute(attr)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{attr.name}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            attr.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attr.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{attr.slug}</p>
                        {typeof attr.valueCount === 'number' && (
                          <p className="text-xs text-gray-400 mt-2">
                            {attr.valueCount} values
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditAttribute(attr);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAttribute(attr);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!attributesLoading && filteredAttributes?.length === 0 && (
              <div className="p-8 text-center">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery || filterActive !== 'all'
                    ? 'No attributes match your filters'
                    : 'No attributes found. Create your first attribute!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Attribute Values */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedAttribute 
                    ? `${selectedAttribute.name} Values` 
                    : 'Attribute Values'
                  }
                </h3>
                {selectedAttribute && (
                  <p className="text-sm text-gray-500 mt-1">
                    Manage values for {selectedAttribute.name}
                  </p>
                )}
              </div>
              
              {selectedAttribute && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEditValue()}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    disabled={!selectedAttribute}
                  >
                    <Plus className="w-4 h-4" />
                    Add Value
                  </button>
                  <button
                    onClick={() => setSelectedAttribute(null)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Deselect"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {selectedAttribute ? (
              <>
                {/* Edit Value Form */}
                {(editValue.value !== undefined) && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800">
                        {editValue._id ? 'Edit Value' : 'Add New Value'}
                      </h4>
                      <button
                        onClick={() => setEditValue({})}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editValue.value || ''}
                        onChange={(e) => setEditValue(prev => ({ ...prev, value: e.target.value }))}
                        placeholder={`Enter ${selectedAttribute.name.toLowerCase()} value`}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <input
                          type="checkbox"
                          id="valueIsActive"
                          checked={editValue.isActive ?? true}
                          onChange={(e) => setEditValue(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="valueIsActive" className="text-sm text-gray-700">
                          Active
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditValue({})}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={editValue._id ? handleUpdateValue : handleCreateValue}
                          disabled={valuesLoading}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {valuesLoading ? 'Saving...' : editValue._id ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Values Grid */}
                {valuesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-500">Loading values...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attributeValues?.map((value) => (
                      <div
                        key={value._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{value.value}</h4>
                            <p className="text-sm text-gray-500 mt-1">{value.slug}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            value.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {value.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => startEditValue(value)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteValue(value)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State for Values */}
                {!valuesLoading && (!attributeValues || attributeValues.length === 0) && (
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                      No values yet
                    </h4>
                    <p className="text-gray-500 mb-6">
                      Add values to the "{selectedAttribute.name}" attribute
                    </p>
                    <button
                      onClick={() => startEditValue()}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Value
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Select an Attribute
                </h4>
                <p className="text-gray-500">
                  Choose an attribute from the list to view and manage its values
                </p>
              </div>
            )}
          </div>

          {/* Bulk Operations (Optional) */}
          {selectedAttribute && attributeValues && attributeValues.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Bulk Operations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    // Bulk activate all values
                    const activatePromises = attributeValues
                      .filter(v => !v.isActive)
                      .map(v => updateValue(`/api/newproducts/attribute-values/${v._id}`, { isActive: true }));
                    
                    Promise.all(activatePromises).then(() => {
                      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute._id}`);
                      toast.success('All values activated');
                    });
                  }}
                  className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  Activate All Values
                </button>
                <button
                  onClick={() => {
                    // Bulk deactivate all values
                    const deactivatePromises = attributeValues
                      .filter(v => v.isActive)
                      .map(v => updateValue(`/api/newproducts/attribute-values/${v._id}`, { isActive: false }));
                    
                    Promise.all(deactivatePromises).then(() => {
                      fetchValues(`/api/newproducts/attribute-values?attribute=${selectedAttribute._id}`);
                      toast.success('All values deactivated');
                    });
                  }}
                  className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Deactivate All Values
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
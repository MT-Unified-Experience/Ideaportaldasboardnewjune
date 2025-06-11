Here's the fixed version with all missing closing brackets added:

```javascript
                      <h4 className="text-md font-medium text-blue-900 mb-2">Current Quarter Features</h4>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => addFeature(true)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </button>
                      </div>

                      {localData.topFeatures.map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vote Count
                              </label>
                              <input
                                type="number"
                                value={feature.vote_count}
                                onChange={(e) => updateFeature(index, 'vote_count', parseInt(e.target.value) || 0, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Client A, Client B"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeFeature(index, true)}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q3 Features (Previous Quarter) */}
                {activeSubTab === 'previous' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="text-lg font-medium text-yellow-900 mb-2">Q3 Features (Previous Quarter)</h3>
                      <p className="text-sm text-yellow-700">
                        Features from the previous quarter for comparison analysis in the quarterly trends chart.
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-md font-medium text-blue-900 mb-2">Previous Quarter Features</h4>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => addFeature(false)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </button>
                      </div>

                      {(localData.previousQuarterFeatures || []).map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name
                              </label>
                              <input
                                type="text"
                                value={feature.feature_name}
                                onChange={(e) => updateFeature(index, 'feature_name', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vote Count
                              </label>
                              <input
                                type="number"
                                value={feature.vote_count}
                                onChange={(e) => updateFeature(index, 'vote_count', parseInt(e.target.value) || 0, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={feature.status}
                                onChange={(e) => updateFeature(index, 'status', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="Under Review">Under Review</option>
                                <option value="Committed">Committed</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client Voters
                              </label>
                              <input
                                type="text"
                                value={feature.client_voters.join(', ')}
                                onChange={(e) => updateFeature(index, 'client_voters', e.target.value, false)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Client A, Client B"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeFeature(index, false)}
                            className="mt-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cross-Client Collaboration Tab */}
            {activeTab === 'collaboration' && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-md font-medium text-green-900 mb-2">Upload Cross-Client Collaboration CSV</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Upload a CSV file containing quarterly cross-client collaboration data with columns: quarter, collaboration_count.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCollaborationUpload}
                      className="hidden"
                      id="collaboration-csv-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="collaboration-csv-upload"
                      className={\`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        isLoading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? 'Uploading...' : 'Upload Collaboration CSV'}
                    </label>
                    {uploadStatus && (
                      <span className={\`text-sm ${
                        uploadStatus.includes('successful') ? 'text-green-600' : 
                        uploadStatus.includes('failed') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {uploadStatus}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    <a 
                      href="data:text/csv;charset=utf-8,quarter,collaboration_count%0AFY25%20Q1,5%0AFY25%20Q2,8%0AFY25%20Q3,12%0AFY25%20Q4,15"
                      download="collaboration_template.csv"
                      className="hover:underline"
                    >
                      Download sample CSV template
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Data Socialization Forums Tab */}
            {activeTab === 'forums' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Data Socialization Forums</h3>
                  <button
                    onClick={addForum}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Forum
                  </button>
                </div>

                <div className="space-y-4">
                  {(localData.data_socialization_forums || []).map((forum, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Forum {index + 1}</h4>
                        <button
                          onClick={() => removeForum(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Forum Name
                        </label>
                        <input
                          type="text"
                          value={forum.name}
                          onChange={(e) => updateForum(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter forum name"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLocalLoading}
                className={\`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                  isLocalLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLocalLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;
```
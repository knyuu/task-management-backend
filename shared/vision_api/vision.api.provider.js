const q = require('q');
const {VisionApiInterface} = require('./vision.api.interface');

const getText = (textAnchor, text) => {
    if (!textAnchor) {
      return '';
    }
      if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return '';
    }
      const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;
  
    return text.substring(startIndex, endIndex);
};

const extractTableData = (table, text) => {
  const cleanCellText = (cell) => {
      return getText(cell.layout.textAnchor, text)
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
  };

  let tableData = [];

  if (table.headerRows?.length) {
      const headerRow = table.headerRows[0].cells.map(cell => cleanCellText(cell));
      tableData.push(headerRow);
  }

  if (table.bodyRows?.length) {
      table.bodyRows.forEach(row => {
          const rowData = row.cells.map(cell => cleanCellText(cell));
          tableData.push(rowData);
      });
  }

  return tableData;
};


class VisionApiProvider {
  constructor() {}
  
  processDocumentGCP(base64String, Fields) {
      let dfd = q.defer();

      const request = {
          name: VisionApiInterface.name,
          rawDocument: {
              content: base64String,
              mimeType: 'application/pdf',
          },
          table_extraction_params: {
              enabled: true,
              ...(Fields.tableHeaders ? { 
                  header_hints: Fields.tableHeaders,
                  header_detection_mode: 'HEADER_DETECTION_STRICT'
              } : {}),
              ...(Fields.forceSplit ? { force_table_split: Fields.forceSplit } : {})
          }
      };

      VisionApiInterface.processDocument(request)
          .then(result => {
              const { document } = result;
              const { text } = document;
              let processedData = {
                  pageCount: document.pages.length,

                  tables: document.pages.flatMap(page => 
                      page.tables?.map((table, tableIndex) => ({
                          pageNumber: page.pageNumber,
                          tableIndex: tableIndex + 1,
                          columns: table.headerRows?.[0]?.cells?.length || table.bodyRows?.[0]?.cells?.length || 0,
                          rows: table.bodyRows?.length || 0,
                          data: extractTableData(table, text)
                      })) || []
                  ),

                  fields: document.pages.flatMap(page => 
                        page.formFields?.map(field => ({
                            pageNumber: page.pageNumber,
                            name: field.fieldName?.textAnchor ? getText(field.fieldName.textAnchor, text) : '',
                            value: field.fieldValue?.textAnchor ? getText(field.fieldValue.textAnchor, text) : ''
                        })) || []
                    ),

                  ocr: document.pages.map(page => ({
                    pageNumber: page.pageNumber,
                    text: page.layout?.textAnchor 
                        ? getText(page.layout.textAnchor, document.text) 
                        : ""
                   }))

              };

              dfd.resolve({
                  message: 'Document processing completed successfully',
                  data: processedData
              });
          })
          .catch(err => {
              dfd.reject({
                  path: "VisionApiProvider.processDocument",
                  mes: err.message || "Unexpected error occurred while processing document"
              });
          });

      return dfd.promise;
  }

  processDocumentVision(base64String) {
    let dfd = q.defer();

    VisionApiInterface.processDocumentWithOpenAI(base64String)
        .then(data => {
            dfd.resolve({
                message: 'Document processed successfully',
                data: data
            });
        })
        .catch(err => {
            dfd.reject({
                path: "VisionApiProvider.processDocumentVision",
                mes: err.message || "Unexpected error occurred while processing document"
            });
        });

    return dfd.promise;
}
}

exports.VisionApiProvider = new VisionApiProvider();

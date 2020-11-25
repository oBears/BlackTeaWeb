using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using Object = System.Object;

public class ExcelTools
{
    private static IWorkbook workbook = null;

    public static List<string> errorInfos = new List<string>();
    
    // public static T[] GetAllInstances<T>() where T : ScriptableObject
    // {
    //     string[] guids = AssetDatabase.FindAssets("t:" + typeof(T).Name); //FindAssets uses tags check documentation for more info
    //     T[] a = new T[guids.Length];
    //     for (int i = 0; i < guids.Length; i++) //probably could get optimized 
    //     {
    //         string path = AssetDatabase.GUIDToAssetPath(guids[i]);
    //         a[i] = AssetDatabase.LoadAssetAtPath<T>(path);
    //     }
    //
    //     return a;
    // }
    //
    // public static void OverwriteData(string data, string fileName, string sheetName, int id, string columnName, int contentRowStart)
    // {
    //     int i = 0;
    //     int j = 0;
    //     int count = 0;
    //     ISheet sheet = null;
    //
    //     using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
    //     {
    //         workbook = new XSSFWorkbook(fs);
    //         fs.Close();
    //     }
    //
    //     if (workbook != null)
    //     {
    //         sheet = workbook.GetSheet(sheetName);
    //     }
    //
    //     if (sheet == null)
    //     {
    //         Debug.LogError($"{fileName} 不存在或者 sheet{sheetName}不存在");
    //         return;
    //     }
    //     
    //     if (File.Exists(fileName))
    //         File.Delete(fileName);
    //
    //     int maxRow = sheet.LastRowNum;
    //     int startRow = sheet.FirstRowNum;
    //
    //     IRow firstRow = sheet.GetRow(0);
    //
    //     int columnIndex = -1;
    //
    //     for (int k = 0; k < firstRow.LastCellNum; k++)
    //     {
    //         var curColumnName = firstRow.GetCell(k).StringCellValue;
    //         if (curColumnName == columnName)
    //         {
    //             columnIndex = k;
    //             break;
    //         }
    //     }
    //
    //     if (columnIndex == -1)
    //     {
    //         //查不到这个列名
    //         return;
    //     }
    //     
    //     for (int start = contentRowStart; start < maxRow; start++)
    //     {
    //         IRow row = sheet.GetRow(start);
    //         
    //         //第一行为Id
    //         var cell = row.GetCell(0);
    //         var rowId = (int)cell.NumericCellValue;
    //         if (rowId == id)
    //         {
    //             //
    //             var dataCell = row.GetCell(columnIndex);
    //             dataCell.SetCellValue(data);
    //             break;
    //         }
    //     }
    //     
    //     using (FileStream fs = File.Open(fileName,  
    //         FileMode.OpenOrCreate, FileAccess.Write))  
    //     {
    //         workbook.Write(fs); //写入到excel
    //         fs.Close();
    //     }
    // }

    public static DataTable ExcelToDataTable(string excelPath,string sheetName,out IRow firstRow,  int startRow = 1)
    {
        if (!File.Exists(excelPath))
        {
            firstRow = null;
            return null;
        }
        
        // if (IsExcelOpen(excelPath))
        // {
        //     firstRow = null;
        //     return null;
        // }
        
        using (FileStream fs = new FileStream(excelPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        {
            workbook = new XSSFWorkbook(fs);

            //Debug.Log("fs is " + (workbook != null));

            if (workbook != null)
            {
                
                ISheet sheet = workbook.GetSheet(sheetName);
                DataTable data = new DataTable();

                //workbook

                firstRow = sheet.GetRow(0);

                int cellCount = firstRow.LastCellNum;
                //最后一列的标号
                int rowCount = sheet.LastRowNum;

                for (int i = 0; i < cellCount; i++)
                {
                    ICell cell = firstRow.GetCell(i);
                    if (cell != null)
                    {
                        string cellValue = cell.StringCellValue;
                        if (cellValue != null)
                        {
                            DataColumn column = new DataColumn(cellValue);
                            data.Columns.Add(column);
                        }
                    }
                }

                for (int i = startRow; i <= rowCount; i++)
                {
                    IRow row = sheet.GetRow(i);
                    if (row == null)
                        continue;

                    //跳过空行
                    if (row.FirstCellNum == -1)
                        continue;;
                    
                    DataRow dataRow = data.NewRow();
                    for (int j = row.FirstCellNum; j < cellCount; j++)
                    {
                        var curDataRow = row.GetCell(j);
                        if (curDataRow != null)
                            dataRow[j] = curDataRow.ToString();
                    }

                    data.Rows.Add(dataRow);
                }

                return data;
            }
            
            fs.Close();
        }

        firstRow = null;
        return null;
    }
    
    // public static int DataTableToExcel(DataTable data, string fileName, string sheetName, bool isColumnWritten)
    // {
    //     int i = 0;
    //     int j = 0;
    //     int count = 0;
    //     ISheet sheet = null;
    //
    //     if (IsExcelOpen(fileName))
    //     {
    //         EditorUtility.DisplayDialog("错误", $"excel文件{fileName}已打开", "ok");
    //         return -1;
    //     }
    //         
    //     
    //     if (File.Exists(fileName))
    //     {
    //         File.Delete(fileName);
    //     }
    //     
    //     using (FileStream fs = new FileStream(fileName, FileMode.OpenOrCreate, FileAccess.ReadWrite))
    //     {
    //         workbook = new XSSFWorkbook();
    //
    //         if (workbook != null)
    //         {
    //             sheet = workbook.CreateSheet(sheetName);
    //         }
    //         else
    //         {
    //             return -1;
    //         }
    //
    //         if (isColumnWritten == true) //写入DataTable的列名
    //         {
    //             IRow row = sheet.CreateRow(0);
    //             for (j = 0; j < data.Columns.Count; ++j)
    //             {
    //                 row.CreateCell(j).SetCellValue(data.Columns[j].ColumnName);
    //             }
    //
    //             count = 1;
    //         }
    //         else
    //         {
    //             count = 0;
    //         }
    //
    //         for (i = 0; i < data.Rows.Count; ++i)
    //         {
    //             IRow row = sheet.CreateRow(count);
    //             for (j = 0; j < data.Columns.Count; ++j)
    //             {
    //                 row.CreateCell(j).SetCellValue(data.Rows[i][j].ToString());
    //             }
    //
    //             ++count;
    //         }
    //
    //         workbook.Write(fs); //写入到excel
    //         return count;
    //     }
    // }

    public static void SetValue(ref object obj, string dataStr, FieldInfo fieldInfo)
    {
        var newValue = ParseStringData(dataStr, fieldInfo.FieldType);

        fieldInfo.SetValue(obj, newValue);
    }
    
    public static void SetValue(ref object obj, string dataStr, PropertyInfo fieldInfo)
    {
        var newValue = ParseStringData(dataStr, fieldInfo.PropertyType);

        fieldInfo.SetValue(obj, newValue);
    }

    public static int GetColumnIndex(IRow firstRow, string columnName)
    {
        int index = -1;
        
        for (int i = firstRow.FirstCellNum; i < firstRow.LastCellNum; i++)
        {
            if (firstRow.GetCell(i).StringCellValue == columnName)
            {
                index = i;
                break;
            }
        }

        return index;
    }
    
    

    private static void TryAddDataStrParseError(string dataStr)
    {
        if (!string.IsNullOrEmpty(dataStr))
        {
            errorInfos.Add(dataStr);
        }
    }
    
    public static object ParseToObject(string dataStr, Type type)
    {
        try
        {
            object ret = null;
            if (type == typeof(float))
            {
                float defaultFloat = 0f;
                if (float.TryParse(dataStr, out defaultFloat))
                {
                    ret = defaultFloat;
                }
                else
                {
                    TryAddDataStrParseError(dataStr);
                }
            }
            else if (type == typeof(int))
            {
                int defaultInt = 0;
                if (int.TryParse(dataStr, out defaultInt))
                {
                    ret = defaultInt;
                }
                else
                {
                    TryAddDataStrParseError(dataStr);
                }

            }
            else if (type == typeof(bool))
            {
                bool defaultBool = false;
                if (bool.TryParse(dataStr, out defaultBool))
                {
                    ret = defaultBool;
                }
                else
                {
                    TryAddDataStrParseError(dataStr);
                }
            }
            else if (type == typeof(string))
            {
                ret = dataStr;
            }
            //else if (type == typeof(Vector2))
            //{
            //    Regex regex = new Regex(@"\((.+?)\)");
            //    Match math = regex.Match(dataStr);

            //    if (math.Success)
            //    {
            //        var floatStr = math.Groups[1].Value;
            //        var floatSplit = floatStr.Split(',');
            //        ret = new Vector2(float.Parse(floatSplit[0]), float.Parse(floatSplit[1]));
            //    }
            //}
            else
            {
                Console.Write($"解析类型{type.ToString()}未支持");
            }
        
            return ret;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }
    }

    private static string[] SplitDataStr(string dataStr)
    {
        if (string.IsNullOrEmpty(dataStr))
            return new string[] { };
        
        var dataStrSplitArray = dataStr.Split(',');
        return dataStrSplitArray;
    }
    
    private static object ParseStringData(string dataStr, Type fieldType)
    {
        if (fieldType.IsArray)
        {
            var elementType = fieldType.GetElementType();
            var dataStrSplitArray = SplitDataStr(dataStr);
            
            //反射数组的大小
            var arrayLength = dataStrSplitArray.Length;

            //这里创建用的参数，应该是int[]里的int，而不是int[]
            var array = Array.CreateInstance(elementType, arrayLength);
            for (int i = 0; i < arrayLength; i++)
            {
                var arrayElementData = ParseStringData(dataStrSplitArray[i], elementType);
                //强转成目标类型
                //var convertedData = Convert.ChangeType(arrayElementData, Type.GetTypeCode(elementType)); 
                array.SetValue(arrayElementData, i); 
            }

            return array;
        }

        if (fieldType.IsEnum)
        {
            //返回未知类型的枚举对象
            var enumInt = 0;
            if (int.TryParse(dataStr, out enumInt))
            {
                
            }
            else
            {
                TryAddDataStrParseError(dataStr);    
            }
            
            return Enum.ToObject(fieldType, enumInt);
        }

        return ParseToObject(dataStr, fieldType);
    }

    public static bool IsExcelOpen(string fileName)
    {
        try
        {
            Stream s = File.Open(fileName, FileMode.Open, FileAccess.Read, FileShare.None);
            s.Close();
            return false;
        }
        catch (IOException)
        {
            return true;
        }
    }
}
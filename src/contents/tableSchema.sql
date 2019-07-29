
SELECT
sc.[name] [ColumnName]  
, st.[name] [DataType]  
, CASE WHEN st.[Name] = 'text' THEN 2147483647 ELSE sc.length End [Length]  
, sc.xprec [Precision]  
, sc.xscale [Scale]  
, sc.iscomputed [Computed]  
,  scm_def.[text] AS [DefaultValue]
, ISNULL(scm.[text], '') [Expression]  
, sc.colstat & 1 [Identity]  
, sc.IsNullable [AllowDBNull]  
, '' [Caption]  
, CAST('' AS VARCHAR(50)) [StringFormat]  
,sc.colorder SeqNo  
 FROM syscolumns sc  
 INNER JOIN systypes st ON st.xtype = sc.xtype  
 INNER JOIN sysobjects so ON so.id = sc.id  
 LEFT OUTER JOIN syscomments scm ON so.id = scm.id AND sc.colorder = scm.number  
 LEFT OUTER JOIN dbo.syscomments scm_def ON sc.cdefault = scm_def.id  
 WHERE (so.name = @ObjectName) AND sc.number=0  
 AND st.Name <> 'sysname'  
ORDER BY SeqNo 
 

SELECT  obj.name AS fk_name,
    sch.name AS [schema_name],
    tab1.name AS [table],
    col1.name AS [column],
    tab2.name AS [referenced_table],
    col2.name AS [referenced_column]
FROM sys.foreign_key_columns fkc
INNER JOIN sys.objects obj
    ON obj.object_id = fkc.constraint_object_id
INNER JOIN sys.tables tab1
    ON tab1.object_id = fkc.parent_object_id
INNER JOIN sys.schemas sch
    ON tab1.schema_id = sch.schema_id
INNER JOIN sys.columns col1
    ON col1.column_id = parent_column_id AND col1.object_id = tab1.object_id
INNER JOIN sys.tables tab2
    ON tab2.object_id = fkc.referenced_object_id
INNER JOIN sys.columns col2
    ON col2.column_id = referenced_column_id AND col2.object_id = tab2.object_id
	WHERE tab1.name = @ObjectName  OR tab2.name = @ObjectName

SELECT 
     TableName = t.name,
     IndexName = ind.name,
     IndexId = ind.index_id,
     ColumnId = ic.index_column_id,
     ColumnName = col.name,
     ind.*,
     ic.*,
     col.* 
FROM 
     sys.indexes ind 
INNER JOIN 
     sys.index_columns ic ON  ind.object_id = ic.object_id and ind.index_id = ic.index_id 
INNER JOIN 
     sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id 
INNER JOIN 
     sys.tables t ON ind.object_id = t.object_id 
WHERE 
     ind.is_primary_key = 0 
     AND ind.is_unique = 0 
     AND ind.is_unique_constraint = 0 
     AND t.is_ms_shipped = 0
	 AND t.name = @ObjectName 
ORDER BY 
     t.name, ind.name, ind.index_id, ic.index_column_id;

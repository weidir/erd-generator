import json
import warnings
from typing import Optional, Union, List
import PyDBML  # type: ignore

DBML_REF_TO_DESCRIPT = {
    ">": "many_to_one",
    "<": "one_to_many",
    "-": "one_to_one",
    "<>": "many_to_many",
}


def parse_table_dbml(
    dbml: Union[str, List[str], dict], include_refs=True
):  # pylint: disable=too-many-locals
    """Parses the dbml statement and returns standard table dictionary.

    Implements table dictionary standard. Under this standard,
    tables have the following structure:

    {
        "table_name": {
            "note": "table description",
            "columns": {
                "column_name": {
                    "type": "column type",
                    "note": "column description",
                    "refs": [list of column references]
                },
                ...
            },
            "refs": [List of table-level references]
        },
        ...
    }

    Args:
        dbml: the input DBML statement
        include_refs: if True, will add object references to the table structure

    Returns:
        A dictionary in the standard formt containing all tables from
        the dbml.
    """
    # pylint: disable=no-member
    if isinstance(dbml, dict):
        return dbml
    if isinstance(dbml, str) and dbml.strip().startswith(("[", "{")):
        try:
            out = json.loads(dbml)
        except json.decoder.JSONDecodeError:
            warnings.warn("Failed to parse dbml object.")
            return None
        return out
    dbml_obj = PyDBML(dbml)
    output_tables = {}
    for table in dbml_obj.tables:
        cols = {}
        for column in table.columns:
            coldef = {
                "name": column.name,
                "type": column.type,
                "note": column.note.text,
                "refs": [],
                "primary_key": column.pk,
            }
            cols.update({column.name.lower(): coldef})
        tabledef = {"description": table.note.text, "columns": cols, "refs": []}
        output_tables.update({table.name.lower(): tabledef})
    if include_refs and dbml_obj.refs:
        for ref in dbml_obj.refs:
            for c_ref in ref.col2:
                source_table_name = ref.col1[0].table.name.lower()
                target_table_name = c_ref.table.name.lower()
                source_col_name = ref.col1[0].name.lower()
                target_col_name = f"{target_table_name}.{c_ref.name.lower()}"
                output_tables[source_table_name]["columns"][source_col_name][
                    "refs"
                ].append(
                    (
                        ("column_name", target_col_name),
                        ("dbml_ref_type", ref.type),
                        ("ref_description", DBML_REF_TO_DESCRIPT[ref.type]),
                    )
                )

                output_tables[source_table_name]["refs"].append(target_table_name)
        for table in output_tables.values():
            table["refs"] = list(set(table["refs"]))
            for column in table["columns"].values():
                unique_refs = list(set(column["refs"]))
                column["refs"] = [dict(kv) for kv in unique_refs]
    return output_tables


def tabledef_to_dbml(schemadef):  # pragma: no cover
    """Converts a table definition in JSON to DBML."""
    fout_list = []
    for tablename, tabledef in schemadef.items():
        if "columns" in tabledef:
            columndef = tabledef["columns"]
            note = tabledef.get("description", None) or tabledef.get("note", None)
        else:
            columndef = tabledef
            note = None
        if not columndef:
            continue
        fout = "Table " + tablename + "{\n    "
        col_out_list = [
            parse_columns_dbml(name, col) for name, col in columndef.items()
        ]
        fout += "\n    ".join(col_out_list)
        if note:
            note_escaped = note.replace("'", r"\'")
            fout += f"\n    Note: '{note_escaped}'"
        fout += "\n}"
        fout_list.append(fout)
    return "\n\n".join(fout_list)


def parse_columns_dbml(
    columnname, columndef
):  # pylint: disable=too-many-branches  # pragma: no cover
    """Parse the column output from the LLM into pieces."""
    column_type = columndef.get("type", "varchar").lower()
    if column_type.startswith(("datetime", "timestamp")):
        coltype = "timestamp"
    elif column_type.startswith(("date")):
        coltype = "date"
    elif column_type.startswith(("double", "float", "numeric")):
        coltype = "float"
    elif column_type.startswith(("integer", "int")):
        coltype = "int"
    else:
        coltype = "varchar"
    colvals = []
    if "not_null" in columndef and columndef["not_null"]:
        colvals.append("not null")
    if "autoincrement" in columndef and columndef["autoincrement"]:
        colvals.append("increment")
    coldesc = (
        columndef.get("note", "")
        or columndef.get("description", "")
        or columndef.get("desc", "")
    )
    if coldesc:
        colvals.append("note: '" + coldesc.replace("'", r"\'") + "'")
    if "refs" in columndef:
        for ref in columndef["refs"]:
            if isinstance(ref, str):
                colvals.append(f"ref: - {ref}")
            elif isinstance(ref, dict):
                colvals.append(f"ref: - {ref['column_name']}")
            else:
                raise RuntimeError(f"Invalid ref found {ref}")
    fout = f"{columnname} {coltype}"
    if colvals:
        fout += " [" + ", ".join(colvals) + "]"
    return fout


def extract_source_target_tables(
    source_dbml: str | dict,
    target_dbml: str | dict = None,
    include_source_refs: bool = True,
):
    """Extract source and optionally target tables from dbml statements."""
    if isinstance(source_dbml, dict):  # pragma: no cover
        source_tables = source_dbml
        if not target_dbml:
            target_dbml = {}
        if isinstance(target_dbml, dict):
            return source_tables, target_dbml
        # If there's a target schema convert source to DBML
        # so it can be combined with target below
        source_dbml = tabledef_to_dbml(source_dbml)

    source_tables = parse_table_dbml(source_dbml, include_refs=include_source_refs)
    if target_dbml is None:
        return source_tables, None
    if isinstance(target_dbml, dict):
        return source_tables, target_dbml
    all_tables = parse_table_dbml(source_dbml + "\n" + target_dbml)
    target_tables = {k: v for k, v in all_tables.items() if k not in source_tables}
    return source_tables, target_tables


async def dbml_to_table_def(
    source_dbml: str,
    target_dbml: Optional[str] = None,
    include_refs: Optional[bool] = True,
) -> dict:
    """Convert DBML to table definition.

    Args:
        source_dbml: String containing DBML or JSON table def
        target_dbml: Optional string containing DBML or JSON table def
        include_refs: Include `refs` element in output
    Returns:
        Table definition in JSON format
    """
    if not target_dbml:
        try:
            parsed_source = parse_table_dbml(source_dbml, include_refs)
            parsed_target = {}
        except Exception as e:  # pylint: disable=broad-exception-caught
            parsed_source = {"error": f"Unable to parse DBML file due to {e}"}
            parsed_target = None
    else:
        try:
            parsed_source, parsed_target = extract_source_target_tables(
                source_dbml, target_dbml, include_refs
            )
        except Exception as e:  # pylint: disable=broad-exception-caught
            parsed_source = {"error": f"Unable to parse DBML file due to {e}"}
            parsed_target = None

    return {"parsed_source": parsed_source, "parsed_target": parsed_target}

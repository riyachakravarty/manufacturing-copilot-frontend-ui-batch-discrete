// src/components/DataVisualizationAndEngineering.jsx
//import React, { useState, useContext, useEffect } from "react";
import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
//import { AppContext } from "../context/AppContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
  MenuItem,
  Select,
  IconButton,
  Slider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useTheme } from "@mui/material/styles";

const BACKEND_URL = "https://manufacturing-copilot-backend-batch.onrender.com";

export default function DataVisualizationAndEngineering() {
  //const { uploadedFile } = useContext(AppContext);
  const theme = useTheme();

  const [expanded, setExpanded] = useState("variability");
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [batchNos, setBatchNos] = useState([]);
  const [selectedBatchNos, setSelectedBatchNos] = useState([]);

  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Other UI states
  const [missingValueColumn, setMissingValueColumn] = useState("");
  const [treatmentMode, setTreatmentMode] = useState("datetime");
  const [outlierAnalysisType, setOutlierAnalysisType] = useState("overall");
  const [outlierColumn, setOutlierColumn] = useState("");
  const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [percOutliersInBatch, setPercOutliersInBatch] = useState(20);
  const [outlierPhase, setOutlierPhase] = useState(""); 
  const [availablePhases, setAvailablePhases] = useState([]);
  //const [outlierPlot, setOutlierPlot] = useState(null);

  // For treatment cards
  const [treatmentMethod, setTreatmentMethod] = useState("Mean");

  // Missing datetime intervals fetched from backend
  const [missingDateTimeIntervals, setMissingDateTimeIntervals] = useState([]);
  const [loadingTreatment, setLoadingTreatment] = useState(false);

  // Selected items for treatment cards
  const [treatmentSelectedColumns, setTreatmentSelectedColumns] = useState([]);
  const [treatmentSelectedIntervals, setTreatmentSelectedIntervals] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [selectedSummaryRows, setSelectedSummaryRows] = useState([]);
  const [selectAllSummaryRows, setSelectAllSummaryRows] = useState(false);


  // Outlier treatment states
  //const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [outlierColumns, setOutlierColumns] = useState([]);
  const [outlierSelectedColumns, setOutlierSelectedColumns] = useState("");
  const [outlierIntervals, setOutlierIntervals] = useState([]);
  const [outlierSelectedIntervals, setOutlierSelectedIntervals] = useState([]);
  const [outlierTreatmentMethod, setOutlierTreatmentMethod] = useState("Mean");
  const [outlierTreatmentType, setOutlierTreatmentType] = useState("overall");
  const [selectAllOutlierSummaryRows, setSelectAllOutlierSummaryRows] = useState(false);
  const [selectedOutlierSummaryRows, setSelectedOutlierSummaryRows] = useState([]);
  const [summaryOutlierRows, setSummaryOutlierRows] = useState([]);

  // Missing value in column treatment mode 
  const [missingValueColumns, setMissingValueColumns] = useState([]);
  const [selectedMissingValueColumn, setSelectedMissingValueColumn] = useState("");
  const [missingValueIntervals, setMissingValueIntervals] = useState([]);
  const [selectedMissingValueIntervals, setSelectedMissingValueIntervals] = useState([]);
  const [missingValueTreatmentMethod, setMissingValueTreatmentMethod] = useState("Mean");

  
    // Select All states
  const [selectAllColumns, setSelectAllColumns] = useState(false);
  const [selectAllDateTimeIntervals, setSelectAllDateTimeIntervals] = useState(false);
  const [selectAllMissingValueIntervals, setSelectAllMissingValueIntervals] = useState(false);
  const [selectAllOutlierIntervals, setSelectAllOutlierIntervals] = useState(false);


    // For phase definitions in a batch
  const [phases, setPhases] = useState([
    {
      phaseName: "",
      startConditions: [
        { column: "", operator: ">", value: "", logic: "AND", conditionType: "first_time" }
      ],
      endConditions: [
        { column: "", operator: "<", value: "", logic: "AND", conditionType: "first_time" }
      ]
    }
  ]);

const addPhase = () => {
  setPhases([
    ...phases,
    {
      phaseName: "",
      startConditions: [
        { column: "", operator: ">", value: "", logic: "AND", conditionType: "first_time" }
      ],
      endConditions: [
        { column: "", operator: "<", value: "", logic: "AND", conditionType: "first_time" }
      ]
    }
  ]);
};

const addCondition = (phaseIndex, section) => {
  const updated = [...phases];
  updated[phaseIndex][section].push({
    column: "",
    operator: ">",
    value: "",
    logic: "AND",
    conditionType: "first_time"
  });
  setPhases(updated);
};

const updateCondition = (phaseIndex, section, condIndex, field, value) => {
  const updated = [...phases];
  updated[phaseIndex][section][condIndex][field] = value;
  setPhases(updated);
};


  // Handlers for "Select All" checkboxes

  // For Columns in Missing Date Times
  const handleSelectAllColumns = (e) => {
    const checked = e.target.checked;
    setSelectAllColumns(checked);
    if (checked) {
      setTreatmentSelectedColumns([...columns]);
    } else {
      setTreatmentSelectedColumns([]);
    }
  };

  // For Intervals in Missing Date Times
  const handleSelectAllDateTimeIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllDateTimeIntervals(checked);
    if (checked) {
      setTreatmentSelectedIntervals([...missingDateTimeIntervals]);
    } else {
      setTreatmentSelectedIntervals([]);
    }
  };

  // For Intervals in Missing Values in Column
  const handleSelectAllMissingValueIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllMissingValueIntervals(checked);
    if (checked) {
      setSelectedMissingValueIntervals([...missingValueIntervals]);
    } else {
      setSelectedMissingValueIntervals([]);
    }
  };

  // For Outlier Intervals in Column
  const handleSelectAllOutlierIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllOutlierIntervals(checked);
    if (checked) {
      setSelectAllOutlierIntervals([...outlierIntervals]);
    } else {
      setSelectAllOutlierIntervals([]);
    }
  };

  // Individual interval toggle for "Missing Values in Column"
  const handleMissingValueIntervalToggle = (interval) => {
    const exists = selectedMissingValueIntervals.some(
      (i) => i.start === interval.start && i.end === interval.end
    );
    if (exists) {
      setSelectedMissingValueIntervals((prev) =>
        prev.filter((i) => !(i.start === interval.start && i.end === interval.end))
      );
    } else {
      setSelectedMissingValueIntervals((prev) => [...prev, interval]);
    }
  };


  //Post treatment output panel
  // To trigger the popup after treatment
  const [showPostTreatmentPrompt, setShowPostTreatmentPrompt] = useState(false);

  // Column selection for updated missing value plot
  const [postTreatmentSelectedColumn, setPostTreatmentSelectedColumn] = useState("");

  // Data for updated missing value plot
  //const [postTreatmentPlotData, setPostTreatmentPlotData] = useState(null);

  // To store latest augmented dataframe for download
  const [latestAugmentedDf, setLatestAugmentedDf] = useState(null);

  const [postTreatmentColumns, setPostTreatmentColumns] = useState([]);

  const [postTreatmentMode, setPostTreatmentMode] = useState("missing"); // "missing" | "outlier"


  useEffect(() => {
    // Fetch columns on mount
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`);
        if (!response.ok) throw new Error("Failed to fetch columns");
        const data = await response.json();
        if (data.columns) {
          setColumns(data.columns);
          setOutlierColumns(data.columns)
        } else {
          setError(data.error || "No columns found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching columns.");
      }
    };
    fetchColumns();
  }, []);

  useEffect(() => {
    // Fetch batch nos. on mount
    const fetchBatchNos = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_batchnos`);
        if (!response.ok) throw new Error("Failed to fetch batch numbers");
        const data = await response.json();
        if (data.batch_numbers) {
          setBatchNos(data.batch_numbers);
        } else {
          setError(data.error || "No batch numbers found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching columns.");
      }
    };
    fetchBatchNos();
  }, []);

  useEffect(() => {
    // Fetch missing datetime intervals from backend when treatment card expands & mode is datetime
    if (expanded === "missingTreatment" && treatmentMode === "datetime") {
      const fetchIntervals = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/missing_datetime_intervals`);
          if (!res.ok) throw new Error("Failed to fetch missing datetime intervals");
          const data = await res.json();
          if (Array.isArray(data.intervals)) {
            setMissingDateTimeIntervals(data.intervals);
          } else {
            setMissingDateTimeIntervals([]);
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching missing datetime intervals");
        }
      };
      fetchIntervals();
    }
  }, [expanded, treatmentMode]);

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    setError("");
    setPlotData(null);
  };

  // Auto-load columns when "Missing Values in Column" mode is selected
  useEffect(() => {
    if (expanded === "missingTreatment" && treatmentMode === "column") {
      const fetchColumns = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/get_columns`);
          if (!res.ok) throw new Error("Failed to fetch columns");
          const data = await res.json();
          if (data.columns) {
            setMissingValueColumns(data.columns);
          }
        } catch (err) {
          console.error("Error loading columns:", err);
          setError("Error loading columns for Missing Values in Column mode");
        }
      };
      fetchColumns();
    }
  }, [expanded, treatmentMode]);

  // Auto-load missing intervals when a column is selected
  useEffect(() => {
  if (selectedMissingValueColumn) {
    const fetchSummaryTable = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/missing_value_intervals?column=${selectedMissingValueColumn}`
        );
        if (!res.ok) throw new Error("Failed to fetch summary table");

        const data = await res.json();
        if (data.table) {
          setSummaryRows(
            data.table.map(r => ({
              id: r.Row_ID,
              batch: r.Batch_No,
              phase: r.Phase_Name,
              timestamp_from: r.Timestamp_From,
              timestamp_to: r.Timestamp_To,
              interval_start: r.Interval_Start,
              interval_end: r.Interval_End,
              rowId: `${r.Batch_No}-${r.Phase_Name}-${r.Timestamp_From}-${r.Timestamp_To}`
            }))
          );
        }
      } catch (err) {
        console.error("Error loading summary rows:", err);
        setSummaryRows([]);
      }
    };

    fetchSummaryTable();
  } else {
    setSummaryRows([]);
    setSelectedSummaryRows([]);
  }
}, [selectedMissingValueColumn]);


// AUTO-RUN Missing Value Analysis when a column is selected
  useEffect(() => {
  if (!selectedMissingValueColumn) return; // Run only when a column is selected

  const runAutoMissingValueAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const prompt = `Missing value analysis where selected variable is '${selectedMissingValueColumn}'`;

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.type === "plot" && data.data) {
        setPlotData(data.data);   // <-- keep plot visible
      }

    } catch (err) {
      console.error("Auto Missing Value Analysis failed:", err);
      setError("Failed to generate missing value plot.");
    } finally {
      setLoading(false);
    }
  };

  runAutoMissingValueAnalysis();

}, [selectedMissingValueColumn]);



  //Auto populate phases for outlier analysis when "phasewise" is selected
  useEffect(() => {
  if (outlierAnalysisType === "phasewise") {
    const fetchPhases = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get_phases`);
        const data = await res.json();

        if (data.phases) {
          setAvailablePhases(data.phases);
        }
      } catch (err) {
        console.error("Error fetching phases:", err);
      }
    };

    fetchPhases();
  }
}, [outlierAnalysisType]);

// Auto-load timestamps when a column for outlier treatment is selected

  useEffect(() => {
  const isPhaseRequired =
    outlierTreatmentType === "phasewise" && !outlierPhase;

  if (
    outlierSelectedColumns &&
    outlierMethod &&
    outlierTreatmentType &&
    !isPhaseRequired
  ) {
    const fetchOutlierSummaryTable = async () => {
      try {
        const query = new URLSearchParams({
          column: outlierSelectedColumns,
          method: outlierMethod,
          analysis_type: outlierTreatmentType,
          phase: outlierTreatmentType === "phasewise" ? outlierPhase : "",
        }).toString();

        const res = await fetch(`${BACKEND_URL}/outlier_intervals_summary?${query}`);

        if (!res.ok) throw new Error("Failed to fetch outlier summary table");

        const data = await res.json();

        if (data.table) {
          setSummaryOutlierRows(
            data.table.map((r) => ({
              id: r.Row_ID,
              batch: r.Batch_No,
              phase: r.Phase_Name,
              timestamp: r.Timestamp,
              counter: r.Counter,
            }))
          );
        } else {
          setSummaryOutlierRows([]);
        }
      } catch (err) {
        console.error("Error loading outlier summary rows:", err);
        setSummaryOutlierRows([]);
      }
    };

    fetchOutlierSummaryTable();
  } else {
    setSummaryOutlierRows([]);
    setSelectedOutlierSummaryRows([]);
  }
}, [
  outlierSelectedColumns,
  outlierMethod,
  outlierTreatmentType,
  outlierPhase
]);




  // Toggle for interval checkboxes in "Missing Values in Column" mode
  //const handleMissingValueIntervalToggle = (interval) => {
    //setSelectedMissingValueIntervals((prev) => {
      //const exists = prev.find(
        //(i) => i.start === interval.start && i.end === interval.end
      //);
      //if (exists) {
        //return prev.filter(
         // (i) => !(i.start === interval.start && i.end === interval.end)
        //);
      //} else {
        //return [...prev, interval];
      //}
    //});
  //};

  // Variability Analysis handlers
  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  

  const handleSummaryRowToggle = (rowId) => {
    setSelectedSummaryRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };


const handleSelectAllSummaryRows = () => {
  if (selectAllSummaryRows) {
    setSelectedSummaryRows([]);
  } else {
    const allIds = summaryRows.map((row) => row.id);
    setSelectedSummaryRows(allIds);
  }
  setSelectAllSummaryRows(!selectAllSummaryRows);
};

const handleSelectAllOutlierSummaryRows = () => {
  if (selectAllOutlierSummaryRows) {
    setSelectedOutlierSummaryRows([]);
  } else {
    const allIds = summaryOutlierRows.map((row) => row.id);
    setSelectedOutlierSummaryRows(allIds);
  }
  setSelectAllOutlierSummaryRows(!selectAllSummaryRows);
};

  const handleSummaryOutlierRowToggle = (rowId) => {
    setSelectedOutlierSummaryRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Batch profiling
  const runBatchProfiling = async () => {
  if (selectedColumns.length === 0) {
    setError("Please select at least one column");
    return;
  }
  if (selectedBatchNos.length === 0) {
    setError("Please select at least one batch");
    return;
  }

  setError("");
  setLoading(true);
  setPlotData(null);

  try {
    const payload = {
      columns: selectedColumns.map(String),
      batch_numbers: selectedBatchNos.map(b => String(b)),
    };

    console.log("Payload sent:", payload);

    const response = await fetch(`${BACKEND_URL}/run_batch_profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();

    // Backend format now:
    // {
    //    type: "plot",
    //    data: { ...plotly figure... },
    //    message: "Batch profiling successful",
    //    num_subplots: number
    // }

    if (result.type === "plot" && result.data) {
      setPlotData(result.data);  // SINGLE plotly figure JSON
    } else {
      setError("Unexpected response structure from server.");
    }

  } catch (err) {
    console.error(err);
    setError("Error running batch profiling.");
  } finally {
    setLoading(false);
  }
};

  const generatePhaseWiseBatchProfiles = async () => {
  try {
    // Basic validations
    if (!phases || phases.length === 0) {
      setError("Please define at least one phase.");
      return;
    }
    if (selectedColumns.length === 0) {
      setError("Please select at least one column (in Batch Profile Generator).");
      return;
    }
    if (selectedBatchNos.length === 0) {
      setError("Please select at least one batch (in Batch Profile Generator).");
      return;
    }

    setError("");
    setLoading(true);
    setPlotData(null);

    // Build payload exactly as backend expects, and include columns & batch_numbers
    const payload = {
      phases: phases.map((ph) => ({
        phaseName: ph.phaseName,
        startConditions: ph.startConditions.map((c) => ({
          column: c.column,
          operator: c.operator,
          value: c.value,
          logic: c.logic,
          conditionType: c.conditionType
        })),
        endConditions: ph.endConditions.map((c) => ({
          column: c.column,
          operator: c.operator,
          value: c.value,
          logic: c.logic,
          conditionType: c.conditionType
        }))
      })),
      // add the columns and batch_numbers selected in the Batch Profile Generator
      plot_columns: selectedColumns.map(String),
      batch_numbers: selectedBatchNos.map((b) => String(b))
    };

    console.log("Sending Phase+Profile Payload:", payload);

    const response = await fetch(`${BACKEND_URL}/define_phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // try to read error body for better debugging
      let errBody = "";
      try {
        errBody = await response.text();
      } catch (e) {}
      throw new Error(`Server error: ${response.status} ${errBody}`);
    }

    const result = await response.json();
    console.log("define_phases result:", result);

    // Expecting { type: "plot", data: {...plotly json...}, ... }
    if (result.type === "plot" && result.data) {
      setPlotData(result.data);  // SINGLE plotly figure JSON
    } else {
      setError("Unexpected response structure from server.");
    }

  } catch (err) {
    console.error(err);
    setError("Error running batch profiling with phase definitions.");
  } finally {
    setLoading(false);
  }
};




  // Missing Value Analysis handlers
  const runMissingValueAnalysis = async () => {
    if (!missingValueColumn) {
      setError("Please select a column for analysis.");
      return;
    }
    setLoading(true);
    setError("");
    setPlotData(null);

    try {
      const prompt = `Missing value analysis where selected variable is ${missingValueColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
        setExpanded(false); // Collapse left accordion to free space
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running missing value analysis.");
    } finally {
      setLoading(false);
    }
  };

  const runOutlierAnalysis = async () => {
  if (!outlierColumn) {
    alert("Please select a column.");
    return;
  }

  if (!outlierMethod) {
    alert("Please select an outlier detection method.");
    return;
  }

  if (outlierAnalysisType === "phasewise" && !outlierPhase) {
    alert("Please select a phase for phasewise analysis.");
    return;
  }

  const payload = {
    analysis_type: outlierAnalysisType,
    column: outlierColumn,
    method: outlierMethod,
    percOutliersInBatch,
    phase: outlierPhase || null  // IMPORTANT FOR BACKEND
  };

  try {
    const res = await fetch(`${BACKEND_URL}/outlier_analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.type === "plot") {
      setPlotData(data.data);
      setExpanded(false);
    } else {
      alert(data.message || "No outliers found.");
    }
  } catch (err) {
    console.error("OError running outlier analysis:", err.message);
  }
};


  // Treatment cards handlers
  const handleTreatmentColumnToggle = (col) => {
    setTreatmentSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleTreatmentIntervalToggle = (interval) => {
    setTreatmentSelectedIntervals((prev) => {
      const exists = prev.some(
        (i) => i.start === interval.start && i.end === interval.end
      );
      if (exists) {
        return prev.filter(
          (i) => !(i.start === interval.start && i.end === interval.end)
        );
      } else {
        return [...prev, interval];
      }
    });
  };

  //const handleOutlierColumnToggle = (col) => {
    //setOutlierSelectedColumns((prev) =>
      //prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    //);
  //};

  // Individual interval toggle for Outliers
  const handleOutlierIntervalToggle = (interval) => {
    const exists = outlierSelectedIntervals.some(
      (i) => i.start === interval.start && i.end === interval.end
    );
    if (exists) {
      setOutlierSelectedIntervals((prev) =>
        prev.filter((i) => !(i.start === interval.start && i.end === interval.end))
      );
    } else {
      setOutlierSelectedIntervals((prev) => [...prev, interval]);
    }
  };

    // Load columns for Missing Values mode
  //const loadMissingValueColumns = async () => {
    //try {
      //const res = await fetch(`${BACKEND_URL}/get_columns`);
      //const data = await res.json();
      //setMissingValueColumns(data.columns || []);
    //} catch (err) {
      //console.error("Error loading missing value columns:", err);
    //}
  //};

  // Load missing value intervals for selected column [NOT NEEDED AS USE EFFECT EXISTS]
  //const loadMissingValueIntervals = async () => {
    //if (!selectedMissingValueColumn) {
      //alert("Please select a column first");
      //return;
    //}
    //try {
      //const res = await fetch(`${BACKEND_URL}/missing_value_intervals?column=${encodeURIComponent(selectedMissingValueColumn)}`);
      //const data = await res.json();
      //setMissingValueIntervals(data.intervals || []);
    //} catch (err) {
      //console.error("Error loading missing value intervals:", err);
    //}
  //};

    // Load outlier intervals for selected column
  //const loadOutlierIntervals = async () => {
    //if (!outlierSelectedColumns) {
      //alert("Please select a column first");
      //return;
    //}
    //try {
      //const res = await fetch(`${BACKEND_URL}/outlier_intervals?column=${encodeURIComponent(outlierSelectedColumns)}`);
      //const data = await res.json();
      //setOutlierIntervals(data.intervals || []);
    //} catch (err) {
      //console.error("Error loading outlier intervals:", err);
    //}
  //};

  //Function to trigger post-treatment prompt
  const handlePostTreatmentFlow = (backendResponse) => {
  if (!backendResponse || !backendResponse.columns) {
    setError("No column data returned from backend.");
    return;
  }

  // Set columns for post-treatment selection
  setPostTreatmentColumns(backendResponse.columns);

  // Show pop-up prompt
  setShowPostTreatmentPrompt(true);
};

//Handler for user selection in pop-up
  const handlePostTreatmentPromptAnswer = (answer) => {
    setShowPostTreatmentPrompt(false);

    if (answer === "yes") {
      // Optionally, clear previous selection & plot
      setPostTreatmentSelectedColumn("");
      //setPostTreatmentPlotData(null);
    }
  };

  //Handler to load missing value plot for selected column
  const loadPostTreatmentMissingValuePlot = async () => {
  if (!postTreatmentSelectedColumn) {
      setError("Please select a column for analysis.");
      return;
    }

    try {
      const prompt = `Post treatment missing value plot where selected variable is ${postTreatmentSelectedColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
        setExpanded(false); // Collapse left accordion to free space
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running missing value analysis.");
    } finally {
      setLoading(false);
    }
  };

  //Handler to load missing value plot for selected column
  const loadPostTreatmentOutlierPlot = async () => {
  if (!postTreatmentSelectedColumn) {
      setError("Please select a column for analysis.");
      return;
    }

    try {
      const prompt = `outlier analysis where selected variable is ${postTreatmentSelectedColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
        setExpanded(false); // Collapse left accordion to free space
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running outlier analysis.");
    } finally {
      setLoading(false);
    }
  };


  // Apply missing value treatment
  const applyMissingValueTreatment = async () => {
    let endpoint = "";
    let payload = {};

    try {
      if (treatmentMode === "datetime") {
        // Missing Date Times mode
        if (treatmentSelectedColumns.length === 0) {
          setError("Please select at least one column for treatment.");
          return;
        }
        if (treatmentSelectedIntervals.length === 0) {
          setError("Please select at least one interval for treatment.");
          return;
        }
        if (!treatmentMethod) {
          setError("Please select a treatment method.");
          return;
        }

        setLoadingTreatment(true);
        setError("");

        payload = {
          columns: treatmentSelectedColumns,
          intervals: treatmentSelectedIntervals,
          method: treatmentMethod,
        };
        endpoint = `${BACKEND_URL}/apply_treatment`;

      } else if (treatmentMode === "column") {
        // Missing Values in Column mode
        if (!selectedMissingValueColumn) {
          alert("Please select a column.");
          return;
        }
        if (!selectedSummaryRows.length) {
          alert("Please select at least one missing value interval.");
          return;
        }
        if (!treatmentMethod) {
          alert("Please select a treatment method.");
          return;
        }

        payload = {
          column: selectedMissingValueColumn,
          intervals: selectedSummaryRows,
          method: missingValueTreatmentMethod,
        };
        endpoint = `${BACKEND_URL}/apply_missing_value_treatment`;

      } else {
        alert("Invalid treatment mode selected.");
        return;
      }

      // Make API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error applying treatment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API returned:", data);
      alert(data.message || "Treatment applied successfully!");
      console.log("Treatment response:", data);

      // Optionally reset selections
      if (treatmentMode === "datetime") {
        setTreatmentSelectedColumns([]);
        setTreatmentSelectedIntervals([]);
      } else if (treatmentMode === "column") {
        setSelectedMissingValueColumn("");
        setSelectedMissingValueIntervals([]);
      }

      // Trigger post-treatment prompt
      setPostTreatmentMode("missing");
      handlePostTreatmentFlow(data);
      setLatestAugmentedDf(data);

    } catch (error) {
      console.error("Error applying missing value treatment:", error);
      setError("Error applying missing value treatment: " + error.message);
    } finally {
      setLoadingTreatment(false);
    }
  };

// Apply outlier treatment
  // Apply Outlier Treatment
const applyOutlierTreatment = async () => {
  try {
    // -------------------------
    //  VALIDATIONS
    // -------------------------

    // 1) Column must be selected
    if (!outlierSelectedColumns) {
      alert("Please select a column for outlier treatment.");
      return;
    }

    // 2) Method (zscore or iqr) must be selected
    if (!outlierMethod) {
      alert("Please select an outlier detection method.");
      return;
    }

    // 3) Treatment type must be selected (overall / phasewise)
    if (!outlierTreatmentType) {
      alert("Please select outlier analysis type (overall / phasewise).");
      return;
    }

    // 4) At least one outlier row must be selected for treatment
    if (!selectedOutlierSummaryRows.length) {
      alert("Please select at least one outlier interval to treat.");
      return;
    }

    // 5) Treatment method must be selected
    if (!outlierTreatmentMethod) {
      alert("Please select an outlier treatment method.");
      return;
    }

    // 6) If phasewise → phase must be selected
    let selectedPhaseToSend = null;
    if (outlierTreatmentType === "phasewise") {
      if (!outlierPhase) {
        alert("Please select a phase for phasewise outlier treatment.");
        return;
      }
      selectedPhaseToSend = outlierPhase;
    }

    // -------------------------
    //  BUILD PAYLOAD
    // -------------------------

    const payload = {
      analysis_type: outlierTreatmentType,          // "overall" | "phasewise"
      column: outlierSelectedColumns,               // column name
      selected_row_ids: selectedOutlierSummaryRows, // list of row IDs
      method: outlierTreatmentMethod,               // Mean, Median, etc.
      phase: selectedPhaseToSend                    // null for overall
    };

    console.log("Sending payload:", payload);

    // -------------------------
    //  SEND REQUEST
    // -------------------------
    const response = await fetch(`${BACKEND_URL}/apply_outlier_treatment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Outlier Treatment Response:", data);

    alert(data.message || "Outlier treatment applied successfully!");

    // UI updates
    setPostTreatmentMode("outlier");
    handlePostTreatmentFlow(data);
    setLatestAugmentedDf(data);

  } catch (error) {
    console.error("Error applying outlier treatment:", error);
    setError("Error applying outlier treatment: " + error.message);
  } finally {
    setLoadingTreatment(false);
  }
};


  return (
    <Grid container spacing={2} sx={{ height: "calc(100vh - 100px)", flexWrap: "nowrap" }}>
      {/* LEFT PANEL */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          px: 1,
          fontSize: "0.85rem",
          flexShrink: 0,
          minWidth: 320, // maintain minimum width even if collapsed
          transition: "width 0.3s ease",
          width: expanded ? 320 : 320, // fixed width, no shrink on collapse to avoid UI issues
        }}
      >
        <Paper
          sx={{
            p: 1,
            bgcolor: theme.palette.background.paper,
            flexGrow: 1,
          }}
          elevation={3}
        >
          {/* Batch profile generation */}
          <Accordion expanded={expanded === "batchprofiles"} onChange={handleExpand("batchprofiles")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Batch Profile Generator
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
      Select Columns
    </Typography>
              <FormControlLabel
      control={
        <Checkbox
          checked={selectedColumns.length === columns.length && columns.length > 0}
          indeterminate={
            selectedColumns.length > 0 && selectedColumns.length < columns.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedColumns(columns);
            } else {
              setSelectedColumns([]);
            }
          }}
          size="small"
        />
      }
      label="Select All Columns"
      sx={{ fontSize: "0.85rem" }}
    />

    <FormGroup sx={{ ml: 1 }}>
      {columns.map((col) => (
        <FormControlLabel
          key={col}
          control={
            <Checkbox
              checked={selectedColumns.includes(col)}
              onChange={() => handleCheckboxChange(col)}
              size="small"
            />
          }
          label={col}
          sx={{ fontSize: "0.85rem" }}
        />
      ))}
    </FormGroup>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
      Select Batch Numbers
    </Typography>

    {/* Select All Batch Numbers */}
    <FormControlLabel
      control={
        <Checkbox
          checked={selectedBatchNos.length === batchNos.length && batchNos.length > 0}
          indeterminate={
            selectedBatchNos.length > 0 &&
            selectedBatchNos.length < batchNos.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBatchNos(batchNos);
            } else {
              setSelectedBatchNos([]);
            }
          }}
          size="small"
        />
      }
      label="Select All Batch Numbers"
      sx={{ fontSize: "0.85rem" }}
    />

    <FormGroup sx={{ ml: 1 }}>
      {batchNos.map((batchno) => (
        <FormControlLabel
          key={batchno}
          control={
            <Checkbox
              checked={selectedBatchNos.includes(batchno)}
              onChange={() => handleCheckboxChange(batchno)}
              size="small"
            />
          }
          label={batchno}
          sx={{ fontSize: "0.85rem" }}
        />
      ))}
    </FormGroup>

              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={runBatchProfiling}>
                Generate Batch Profiles
              </Button>
            </AccordionDetails>
          </Accordion>



 {/* Phase defintion in a batch */}

<Accordion sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Phase Definition Within a Batch
        </Typography>
      </AccordionSummary>

      <AccordionDetails>

        {phases.map((phase, pIndex) => (
          <Box key={pIndex} sx={{ border: "1px solid #444", p: 2, mb: 3, borderRadius: 2 }}>

            {/* Phase Name */}
            <TextField
              label="Phase Name"
              value={phase.phaseName}
              onChange={(e) => {
                const updated = [...phases];
                updated[pIndex].phaseName = e.target.value;
                setPhases(updated);
              }}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {/* ================== START LOGIC ================== */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Start Logic
            </Typography>

            {phase.startConditions.map((cond, cIndex) => (
              <Grid container spacing={1} alignItems="center" key={cIndex} sx={{ mb: 1 }}>

                {/* Column Selector */}
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Column</InputLabel>
                    <Select
                      label="Column"
                      value={cond.column}
                      onChange={(e) =>
                        updateCondition(pIndex, "startConditions", cIndex, "column", e.target.value)
                      }
                    >
                      {columns.map((col) => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Operator */}
                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Op"
                    placeholder="<, >, ="
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(pIndex, "startConditions", cIndex, "operator", e.target.value)
                    }
                  />
                </Grid>

                {/* Value */}
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Value"
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(pIndex, "startConditions", cIndex, "value", e.target.value)
                    }
                  />
                </Grid>

                {/* Condition Type */}
                <Grid item xs={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition Type</InputLabel>
                    <Select
                      label="Condition Type"
                      value={cond.conditionType}
                      onChange={(e) =>
                        updateCondition(
                          pIndex,
                          "startConditions",
                          cIndex,
                          "conditionType",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="first_time">First time</MenuItem>
                      <MenuItem value="n_times">N times consecutively</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* AND / OR */}
                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Logic</InputLabel>
                    <Select
                      label="Logic"
                      value={cond.logic}
                      onChange={(e) =>
                        updateCondition(pIndex, "startConditions", cIndex, "logic", e.target.value)
                      }
                    >
                      <MenuItem value="AND">AND</MenuItem>
                      <MenuItem value="OR">OR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={() => addCondition(pIndex, "startConditions")}
              sx={{ mb: 2 }}
            >
              + Add Start Condition
            </Button>

            {/* ================== END LOGIC ================== */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
              End Logic
            </Typography>

            {phase.endConditions.map((cond, cIndex) => (
              <Grid container spacing={1} alignItems="center" key={cIndex} sx={{ mb: 1 }}>

                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Column</InputLabel>
                    <Select
                      label="Column"
                      value={cond.column}
                      onChange={(e) =>
                        updateCondition(pIndex, "endConditions", cIndex, "column", e.target.value)
                      }
                    >
                      {columns.map((col) => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={1}>
                  <TextField
                    size="small"
                    label="Op"
                    placeholder="<, >, ="
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(pIndex, "endConditions", cIndex, "operator", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Value"
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(pIndex, "endConditions", cIndex, "value", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition Type</InputLabel>
                    <Select
                      label="Condition Type"
                      value={cond.conditionType}
                      onChange={(e) =>
                        updateCondition(
                          pIndex,
                          "endConditions",
                          cIndex,
                          "conditionType",
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="first_time">First time</MenuItem>
                      <MenuItem value="n_times">N times consecutively</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Logic</InputLabel>
                    <Select
                      label="Logic"
                      value={cond.logic}
                      onChange={(e) =>
                        updateCondition(pIndex, "endConditions", cIndex, "logic", e.target.value)
                      }
                    >
                      <MenuItem value="AND">AND</MenuItem>
                      <MenuItem value="OR">OR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={() => addCondition(pIndex, "endConditions")}
            >
              + Add End Condition
            </Button>

          </Box>
        ))}

        <Button variant="contained" size="small" onClick={addPhase}>
          + Add New Phase
        </Button>

        <Button
  variant="contained"
  size="small"
  sx={{ mt: 2 }}
  onClick={generatePhaseWiseBatchProfiles}
>
  Generate batch profiles with phase demarcations
</Button>


      </AccordionDetails>
    </Accordion>

          {/* Missing Value Analysis */}
          <Accordion
            expanded={expanded === "missingAnalysis"}
            onChange={handleExpand("missingAnalysis")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Missing Value Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                maxWidth: 300,
                overflowY: "auto",
                maxHeight: 300,
                pr: 1,
              }}
            >
              <RadioGroup
                value={missingValueColumn}
                onChange={(e) => setMissingValueColumn(e.target.value)}
                sx={{ maxWidth: "100%" }}
              >
                {columns.map((col) => (
                  <FormControlLabel
                    key={col}
                    value={col}
                    control={<Radio size="small" />}
                    label={col}
                    sx={{ fontSize: "0.85rem" }}
                  />
                ))}
              </RadioGroup>
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={runMissingValueAnalysis}>
                Run Missing Value Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Missing Value Treatment */}
<Accordion
  expanded={expanded === "missingTreatment"}
  onChange={handleExpand("missingTreatment")}
>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      Missing Value Treatment
    </Typography>
  </AccordionSummary>
  <AccordionDetails>
    <RadioGroup
      row
      value={treatmentMode}
      onChange={(e) => setTreatmentMode(e.target.value)}
      sx={{ mb: 1 }}
    >
      <FormControlLabel
        value="datetime"
        control={<Radio size="small" />}
        label="Missing Date Times"
        sx={{ fontSize: "0.85rem" }}
      />
      <FormControlLabel
        value="column"
        control={<Radio size="small" />}
        label="Missing Values in Column"
        sx={{ fontSize: "0.85rem" }}
      />
    </RadioGroup>

    {treatmentMode === "datetime" && (
      <Grid container spacing={2}>
        {/* Columns List with Select All */}
        <Grid
          item
          xs={4}
          sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Columns
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox size="small" checked={selectAllColumns} onChange={handleSelectAllColumns} />
              }
              label="Select All"
              sx={{ fontSize: "0.85rem" }}
            />
            {columns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Checkbox
                    size="small"
                    checked={treatmentSelectedColumns.includes(col)}
                    onChange={() => handleTreatmentColumnToggle(col)}
                  />
                }
                label={col}
                sx={{ fontSize: "0.85rem" }}
              />
            ))}
          </FormGroup>
        </Grid>

        {/* Intervals List with Select All */}
        <Grid
          item
          xs={4}
          sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pl: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Intervals
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={selectAllDateTimeIntervals}
                  onChange={handleSelectAllDateTimeIntervals}
                />
              }
              label="Select All"
              sx={{ fontSize: "0.85rem" }}
            />
            {missingDateTimeIntervals.length > 0 ? (
              missingDateTimeIntervals.map((interval) => {
                const checked = treatmentSelectedIntervals.some(
                  (i) => i.start === interval.start && i.end === interval.end
                );
                return (
                  <FormControlLabel
                    key={`${interval.start}-${interval.end}`}
                    control={
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => handleTreatmentIntervalToggle(interval)}
                      />
                    }
                    label={`${interval.start} → ${interval.end}`}
                    sx={{ fontSize: "0.85rem" }}
                  />
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No missing datetime intervals found.
              </Typography>
            )}
          </FormGroup>
        </Grid>

        
        {/* Treatment Method */}
        <Grid item xs={4}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Treatment Method
          </Typography>
          <Select
            size="small"
            value={treatmentMethod}
            onChange={(e) => setTreatmentMethod(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="Mean">Mean</MenuItem>
            <MenuItem value="Median">Median</MenuItem>
            <MenuItem value="Forward fill">Forward Fill</MenuItem>
            <MenuItem value="Backward fill">Backward Fill</MenuItem>
            <MenuItem value="Delete rows">Delete rows</MenuItem>
          </Select>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2 }}
            onClick={applyMissingValueTreatment}
            disabled={loadingTreatment}
          >
            {loadingTreatment ? "Applying..." : "Apply Treatment"}
          </Button>
        </Grid>
      </Grid>
    )}

    {treatmentMode === "column" && (
      <Grid container spacing={2}>
        {/* Columns Radio List */}
        <Grid
          item
          xs={6}
          sx={{ maxHeight: 150, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Columns
          </Typography>
          <FormGroup>
            {missingValueColumns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Radio
                    size="small"
                    checked={selectedMissingValueColumn === col}
                    onChange={() => setSelectedMissingValueColumn(col)}
                  />
                }
                label={col}
                sx={{ fontSize: "0.85rem" }}
              />
            ))}
          </FormGroup>
        </Grid>

        {/* Intervals List with Select All */}
        <Grid
  item
  xs={12}
  sx={{
    maxHeight: 350,
    overflowY: "auto",
    p: 2,
    border: "1px solid #ccc",
    borderRadius: 2,
    mt: 2,
    backgroundColor: "#fafafa"
  }}
>
  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
    Missing Value Interval Summary Table
  </Typography>

  {/* SELECT ALL */}
  <FormControlLabel
    control={
      <Checkbox
        size="small"
        checked={selectAllSummaryRows}
        onChange={handleSelectAllSummaryRows}
      />
    }
    label="Select All"
    sx={{ mb: 2 }}
  />

  {/* HEADER */}
  <Grid container sx={{ fontWeight: "bold", borderBottom: "1px solid #ccc", pb: 1 }}>
  <Grid item xs={1}></Grid>

  <Grid item xs={2}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Batch</Typography>
  </Grid>

  <Grid item xs={2}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Phase</Typography>
  </Grid>

  <Grid item xs={3}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Timestamp From</Typography>
  </Grid>

  <Grid item xs={3}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Timestamp To</Typography>
  </Grid>
</Grid>

  {/* ROWS */}
  {summaryRows.length > 0 ? (
    summaryRows.map((row, idx) => {

      const isNewInterval =
        idx === 0 ||
        (summaryRows[idx].interval_start !== summaryRows[idx - 1].interval_start &&
        summaryRows[idx].interval_end !== summaryRows[idx - 1].interval_end);

      return (
        <React.Fragment key={row.id}>
          {/* Horizontal line between missing-value intervals */}
          {isNewInterval && idx !== 0 && (
            <Divider sx={{ my: 1, borderColor: "#aaa" }} />
          )}

          <Grid
            container
            sx={{
              py: 1,
              borderBottom: "1px solid #eee",
              alignItems: "center"
            }}
          >
            {/* Checkbox */}
            <Grid item xs={1}>
              <Checkbox
                size="small"
                checked={selectedSummaryRows.includes(row.id)}
                onChange={() => handleSummaryRowToggle(row.id)}
              />
            </Grid>

            <Grid item xs={2}>
          <Typography variant="body2" sx={{ pl: 1 }}>{row.batch}</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="body2" sx={{ pl: 1 }}>{row.phase || "-"}</Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" sx={{ pl: 1, whiteSpace: "nowrap" }}>
            {row.timestamp_from}
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" sx={{ pl: 1, whiteSpace: "nowrap" }}>
            {row.timestamp_to}
          </Typography>
        </Grid>
          </Grid>
        </React.Fragment>
      );
    })
  ) : (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      No summarized rows found.
    </Typography>
  )}
</Grid>




        {/* Treatment Method */}
        <Grid item xs={12}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Treatment Method
          </Typography>
          <Select
            size="small"
            value={missingValueTreatmentMethod}
            onChange={(e) => setMissingValueTreatmentMethod(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="Forward fill">Forward Fill</MenuItem>
            <MenuItem value="Backward fill">Backward Fill</MenuItem>
            <MenuItem value="Mean">Mean</MenuItem>
            <MenuItem value="Median">Median</MenuItem>
            <MenuItem value="Delete rows">Delete rows</MenuItem>
          </Select>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2 }}
            onClick={applyMissingValueTreatment}
            Apply Missing Value Treatment
            disabled={loadingTreatment}
          >
            {loadingTreatment ? "Applying..." : "Apply Treatment"}
          </Button>
          
        </Grid>
      </Grid>
    )}
  </AccordionDetails>
</Accordion>



          {/* Outlier Analysis */}
          <Accordion expanded={expanded === "outlierAnalysis"} onChange={handleExpand("outlierAnalysis")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Outlier Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                maxWidth: 300,
                overflowY: "auto",
                maxHeight: 300,
                pr: 1,
              }}
            ><RadioGroup
                row
                value={outlierAnalysisType}
                onChange={(e) => setOutlierAnalysisType(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel
                  value="overall"
                  control={<Radio size="small" />}
                  label="Analysis over batch duration"
                  sx={{ fontSize: "0.85rem" }}
                />
                <FormControlLabel
                  value="phasewise"
                  control={<Radio size="small" />}
                  label="Analysis over phase duration"
                  sx={{ fontSize: "0.85rem" }}
                />
              </RadioGroup>



              {/* Column Selection */}
              <RadioGroup
                value={outlierColumn}
                onChange={(e) => setOutlierColumn(e.target.value)}
                sx={{ maxWidth: "100%" }}
              >
                {columns.map((col) => (
                  <FormControlLabel
                    key={col}
                    value={col}
                    control={<Radio size="small" />}
                    label={col}
                    sx={{ fontSize: "0.85rem" }}
                  />
                ))}
              </RadioGroup>

              {/* Phase Selection (only for phasewise) */}
              {outlierAnalysisType === "phasewise" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Select Phase
                  </Typography>

                  <Select
                    size="small"
                    fullWidth
                    value={outlierPhase}
                    onChange={(e) => setOutlierPhase(e.target.value)}
                  >
                    {availablePhases.length > 0 ? (
                      availablePhases.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No phases available</MenuItem>
                    )}
                  </Select>
                </Box>
              )}

              {/* Method Selection */}
              <RadioGroup
                value={outlierMethod}
                onChange={(e) => setOutlierMethod(e.target.value)}
                row
              >
                <FormControlLabel
                  value="zscore"
                  control={<Radio size="small" />}
                  label="Z-Score"
                  sx={{ fontSize: "0.85rem" }}
                />
                <FormControlLabel
                  value="iqr"
                  control={<Radio size="small" />}
                  label="IQR"
                  sx={{ fontSize: "0.85rem" }}
                />
              </RadioGroup>

             <Box sx={{ px: 2, mt: 2 }}>
  <Typography gutterBottom>
    Select batches to display with greater than xx% of outliers: {percOutliersInBatch}%
  </Typography>

  <Slider
    value={Number(percOutliersInBatch || 0)}
    onChange={(e, newValue) => {
      if (typeof newValue === "number") {
        setPercOutliersInBatch(newValue);
      }
    }}
    aria-labelledby="outlier-perc-slider"
    step={1}
    min={0}
    max={100}
    valueLabelDisplay="auto"
  />
</Box>

              {/* Run Button */}
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={runOutlierAnalysis}
              >
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>


          {/* Outlier Treatment */}
          <Accordion expanded={expanded === "outlierTreatment"} onChange={handleExpand("outlierTreatment")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Outlier Treatment
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                maxWidth: 300,
                overflowY: "auto",
                maxHeight: 300,
                pr: 1,
              }}
            ><RadioGroup
                row
                value={outlierTreatmentType}
                onChange={(e) => setOutlierTreatmentType(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel
                  value="overall"
                  control={<Radio size="small" />}
                  label="Treatment over batch duration"
                  sx={{ fontSize: "0.85rem" }}
                />
                <FormControlLabel
                  value="phasewise"
                  control={<Radio size="small" />}
                  label="Treatment over phase duration"
                  sx={{ fontSize: "0.85rem" }}
                />
              </RadioGroup>

                {/* Column List */}
                <Grid
                  item
                  xs={6}
                  sx={{ maxHeight: 150, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Columns
                  </Typography>
                  <FormGroup>
                    {outlierColumns.map((col) => (
                      <FormControlLabel
                        key={col}
                        control={
                          <Radio
                            size="small"
                            checked={outlierSelectedColumns === col}
                            onChange={() => setOutlierSelectedColumns(col)}
                          />
                        }
                        label={col}
                        sx={{ fontSize: "0.85rem" }}
                      />
                      ))}
                  </FormGroup>
                </Grid>

                {/* Phase Selection (only for phasewise) */}
              {outlierTreatmentType === "phasewise" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Select Phase
                  </Typography>

                  <Select
                    size="small"
                    fullWidth
                    value={outlierPhase}
                    onChange={(e) => setOutlierPhase(e.target.value)}
                  >
                    {availablePhases.length > 0 ? (
                      availablePhases.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No phases available</MenuItem>
                    )}
                  </Select>
                </Box>
              )}

               <Typography variant="caption" sx={{ fontWeight: "bold", mt: 2 }}>
                  Outlier Detection Method
                </Typography>
                <RadioGroup
                  value={outlierMethod}
                  onChange={(e) => setOutlierMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="zscore"
                    control={<Radio size="small" />}
                    label="Z-Score"
                  />
                  <FormControlLabel
                    value="iqr"
                    control={<Radio size="small" />}
                    label="IQR"
                  />
                </RadioGroup>

              {/* Intervals List with Select All */}
        <Grid
  item
  xs={12}
  sx={{
    maxHeight: 350,
    overflowY: "auto",
    p: 2,
    border: "1px solid #ccc",
    borderRadius: 2,
    mt: 2,
    backgroundColor: "#fafafa"
  }}
>
  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
    Outliers Summary Table
  </Typography>

  {/* SELECT ALL */}
  <FormControlLabel
    control={
      <Checkbox
        size="small"
        checked={selectAllOutlierSummaryRows}
        onChange={handleSelectAllOutlierSummaryRows}
      />
    }
    label="Select All"
    sx={{ mb: 2 }}
  />

  {/* HEADER */}
  <Grid container sx={{ fontWeight: "bold", borderBottom: "1px solid #ccc", pb: 1 }}>
  <Grid item xs={1}></Grid>

  <Grid item xs={2}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Batch</Typography>
  </Grid>

  <Grid item xs={2}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Phase</Typography>
  </Grid>

  <Grid item xs={3}>
    <Typography variant="subtitle2" sx={{ pl: 1 }}>Timestamp</Typography>
  </Grid>


  {/* ROWS */}
  {summaryOutlierRows.length > 0 ? (
    summaryOutlierRows.map((row, idx) => {

          <Grid
            container
            sx={{
              py: 1,
              borderBottom: "1px solid #eee",
              alignItems: "center"
            }}
          >
            {/* Checkbox */}
            <Grid item xs={1}>
              <Checkbox
                size="small"
                checked={selectedOutlierSummaryRows.includes(row.id)}
                onChange={() => handleSummaryOutlierRowToggle(row.id)}
              />
            </Grid>

            <Grid item xs={2}>
          <Typography variant="body2" sx={{ pl: 1 }}>{row.batch}</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="body2" sx={{ pl: 1 }}>{row.phase || "-"}</Typography>
        </Grid>

        <Grid item xs={3}>
          <Typography variant="body2" sx={{ pl: 1, whiteSpace: "nowrap" }}>
            {row.timestamp}
          </Typography>
        </Grid>
          </Grid>
      ;
    })
  ) : (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      No summarized rows found.
    </Typography>
  )}
</Grid>


                {/* Treatment Method */}
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Treatment Method
                  </Typography>
                  <Select
                    size="small"
                    value={outlierTreatmentMethod}
                    onChange={(e) => setOutlierTreatmentMethod(e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="Mean">Mean</MenuItem>
                    <MenuItem value="Median">Median</MenuItem>
                    <MenuItem value="Forward fill">Forward Fill</MenuItem>
                    <MenuItem value="Backward fill">Backward Fill</MenuItem>
                    <MenuItem value="Delete rows">Delete rows</MenuItem>
                    <MenuItem value="Delete batch">Delete batch</MenuItem>
                  </Select>

                  <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={applyOutlierTreatment}>
                    Apply Outlier Treatment
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>

      {/* RIGHT PANEL */}
      
<Grid
  item
  xs={12}
  md={8}
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
  }}
>
  <Paper
    sx={{
      p: 2,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: theme.palette.background.paper,
    }}
    elevation={3}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Analysis Output
      </Typography>
      {/* Latest Augmented Data Download */}
      {latestAugmentedDf && (
        
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/download`);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "treated_data.csv"; // same name as backend header
    link.click();
  } catch (err) {
    console.error(err);
    setError("Failed to download file from server.");
  }
}}

        >
          Download Latest Data
        </Button>
    )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {plotData && (
  <Plot
    data={plotData.data}
    layout={plotData.layout}
    config={{ responsive: true }}
    style={{ width: "100%", height: "auto" }}
  />
)}


      {/* Post-Treatment Prompt Dialog */}
      <Dialog open={showPostTreatmentPrompt} onClose={() => setShowPostTreatmentPrompt(false)}>
        <DialogTitle>View Updated Plot post treatment?</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to select a column and view updated plot?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePostTreatmentPromptAnswer("no")}>No</Button>
          <Button onClick={() => handlePostTreatmentPromptAnswer("yes")} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post-Treatment Column Selection & Plot */}
      {postTreatmentColumns?.length > 0 && (
      //{postTreatmentColumns?.length > 0 && postTreatmentSelectedColumn !== null && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {postTreatmentMode === "missing"
              ? "Select Column for Updated Missing Value Plot"
              : "Select Column for Updated Outlier Plot"}
          </Typography>
          <FormGroup>
            {postTreatmentColumns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Radio
                    size="small"
                    checked={postTreatmentSelectedColumn === col}
                    onChange={() => setPostTreatmentSelectedColumn(col)}
                  />
                }
                label={col}
                sx={{ fontSize: "0.85rem" }}
              />
            ))}
          </FormGroup>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={
              postTreatmentMode === "missing"
                ? loadPostTreatmentMissingValuePlot
                : loadPostTreatmentOutlierPlot
            }
          >
            Load Updated Analysis
          </Button>
        </Box>
      )}

      
    </Box>
  </Paper>
</Grid>
</Grid>
  );
}
const csv = require("csvtojson");
const fs = require("fs");
const usage_code = {
  NU001: "vit_a",
  NU005: "vit_c",
  NU006: "vit_d",
  NU007: "vit_e",
  NU017: "biotin",
  NU009: "folate",
  NU011: "iron",
  NU013: "omg3",
  NU016: "zinc",
  SK013: "alopecia",
  SK018: "premature_gray",
  SK012: "psoriasis",
  SK011: "dry_skin",
  SS004: "insomnia",
  LV007: "premature_menopause",
  SK019: "minoxidil",
  SK020: "finasteride",
  SK0201: "dutasteride",
};
let extract_data = {
  vit_a: "",
  vit_c: "",
  vit_d: "",
  vit_e: "",
  biotin: "",
  folate: "",
  iron: "",
  omg3: "",
  zinc: "",
  alopecia: "",
  premature_gray: "",
  psoriasis: "",
  dry_skin: "",
  insomnia: "",
  premature_menopause: "",
  minoxidil: "",
  finasteride: "",
  dutasteride: "",
};

const tsvJSON = (tsv) => {
  const lines = tsv.split("\n");
  const result = [];
  const headers = lines[0].split("\t");

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split("\t");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  return result;
};

const loadInputData = async () => {
  let input_data = [];
  let test = require("../uploads/sample_input.tsv");
  const testTsv = fs.readFileSync(test, "utf8");
  const jsonT = tsvJSON(testTsv.toString());
  console.log(JSON.parse(jsonT));
  return;
  for await (const data of data_tsv) {
    input_data.push(data);
  }
  input_data.forEach((data) => {
    if (usage_code[data.code] in extract_data) {
      extract_data[usage_code[data.code]] = data["interpret.3scale"];
      // SK020 finasteride & dutasteride use same value
      extract_data["dutasteride"] = extract_data["finasteride"];
    }
  });
  return extract_data;
};

const loadRecommandReference = async () => {
  let recommen_reference = [];
  const recom_tsv = await d3.tsv("../files/test-report/recommen_reference.tsv");
  for await (const element of recom_tsv) {
    recommen_reference.push(element);
  }
  recommen_reference.forEach((data) => {
    // low_rec medhigh_rec
    if (usage_code[data.code]) {
      if (extract_data[usage_code[data.code]] + "_rec" in data) {
        recom_data["rec_" + usage_code[data.code]] =
          data[extract_data[usage_code[data.code]] + "_rec"];
      }
      if ("med" + extract_data[usage_code[data.code]] + "_rec" in data) {
        recom_data["rec_" + usage_code[data.code]] =
          data["med" + extract_data[usage_code[data.code]] + "_rec"];
      }
      if (extract_data[usage_code[data.code]] + "high_rec" in data) {
        recom_data["rec_" + usage_code[data.code]] =
          data[extract_data[usage_code[data.code]] + "high_rec"];
      }
    }
  });
  return recommen_reference;
};

const loadInfoReference = async () => {
  let info_reference = [];
  const info_tsv = await csvtojson().fromFile(
    "../files/test-report/info_reference.tsv"
  );
  for await (const element of info_tsv) {
    info_reference.push(element);
  }
  info_reference.forEach((data) => {
    if ("info_" + usage_code[data.gfs_code] in info_data) {
      info_data["info_" + usage_code[data.gfs_code]] = data.text_thai;
    }
  });
  return info_reference;
};

const uploadInput = (req, res, next) => {
  console.log(req.files);
  res.status(200).send("Upload File Successfuly");
};

const getTestReportData = async (req, res, next) => {
  const inputData = await loadInputData();
  //   const recommendReference = await loadRecommandReference();
  //   const infoReference = await loadInfoReference();
  let summary_data = [];

  summary_data.push(inputData);
  summary_data.push(recommendReference);
  summary_data.push(infoReference);
  try {
    res.status(200).send(summary_data);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

module.exports = { uploadInput, getTestReportData };

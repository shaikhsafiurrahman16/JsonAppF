import React, { useState } from "react";
import { Collapse, Checkbox, Radio, Row, Col, Button } from "antd";

function Advance({ setFormData }) {
  const [advanceOptions, setAdvanceOptions] = useState({
    fail: "",
    Element: "",
    options: {
      random: false,
      Step: false,
      Visible: false,
      Network: false,
    },
  });
  

  const RadioChange = (field, value) => {
    setAdvanceOptions((prev) => {
      const updated = { ...prev, [field]: value };
      setFormData((prevForm) => ({ ...prevForm, advance: updated }));
      return updated;
    });
  };

  const CheckboxChange = (field, value) => {
    setAdvanceOptions((prev) => {
      const updated = {
        ...prev,
        options: { ...prev.options, [field]: value },
      };
      setFormData((prevForm) => ({ ...prevForm, advance: updated }));
      return updated;
    });
  };

  const Reset = () => {
    const resetData = {
      fail: "",
      Element: "",
      options: {
        random: false,
        Step: false,
        Visible: false,
        Network: false,
      },
    };
    setAdvanceOptions(resetData);
    setFormData((prevForm) => ({ ...prevForm, advance: resetData }));
  };

  const items = [
    {
      key: "1",
      label: "Advanced Options",
      children: (
        <div
          style={{
            padding: "15px 20px",
            marginTop: "10px",
            border: "1px solid black",
            borderRadius: "6px",
          }}
        >
          <Row gutter={[32, 16]}>
            <Col xs={24} md={8}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                When This Step Fails
              </div>
              <Radio.Group
                value={advanceOptions.fail}
                onChange={(e) => RadioChange("fail", e.target.value)}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <Radio value="fail">Mark Error & Fails</Radio>
                <Radio value="continue">Mark Error & Continue</Radio>
                <Radio value="warning">Mark Warning & Continue</Radio>
              </Radio.Group>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Target Element
              </div>
              <Radio.Group
                value={advanceOptions.Element}
                onChange={(e) => RadioChange("Element", e.target.value)}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <Radio value="elementText">Element Text</Radio>
                <Radio value="custom">Custom</Radio>
                <Radio value="never">Never (Skip)</Radio>
              </Radio.Group>
            </Col>

            <Col xs={24} md={8}>
              <Checkbox
                checked={advanceOptions.options.random}
                onChange={(e) => CheckboxChange("random", e.target.checked)}
              >
                This is a random step
              </Checkbox>
              <br />
              <Checkbox
                checked={advanceOptions.options.Step}
                onChange={(e) => CheckboxChange("Step", e.target.checked)}
              >
                Skip this step
              </Checkbox>
              <br />
              <Checkbox
                checked={advanceOptions.options.Visible}
                onChange={(e) => CheckboxChange("Visible", e.target.checked)}
              >
                Element Must Be Visible
              </Checkbox>
              <br />
              <Checkbox
                checked={advanceOptions.options.Network}
                onChange={(e) => CheckboxChange("Network", e.target.checked)}
              >
                Record Its Network Call ?
              </Checkbox>
            </Col>
          </Row>
          <Button
            style={{ marginTop: 15 }}
            size="small"
            type="default"
            onClick={Reset}
          >
            Reset
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Collapse
      items={items}
      style={{
        border: "none",
        backgroundColor: "white",
      }}
    />
  );
}

export default Advance;

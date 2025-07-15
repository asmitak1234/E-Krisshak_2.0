import React, { useState, useEffect } from "react";
import { Form, Button, Collapse, Row, Col } from "react-bootstrap";
import axios from "../axios";
import "../App.css";

const fieldOptions = {
  krisshak: [
    { name: "requirements", label: "Requirements", type: "text" },
    { name: "land_location", label: "Land Location", type: "text" },
    { name: "land_area_min", label: "Min. Land Area", type: "number" },
    { name: "land_area_max", label: "Max. Land Area", type: "number" },
    { name: "age_min", label: "Min. Age", type: "number" }, // ✅ add this
    { name: "age_max", label: "Max. Age", type: "number" }, // ✅ and this
    { name: "availability", label: "Only Show Available", type: "checkbox" },
  ],
  bhooswami: [
    { name: "specialization", label: "Specialization", type: "text" },
    { name: "experience_min", label: "Min. Experience", type: "number" },
    { name: "experience_max", label: "Max. Experience", type: "number" },
    { name: "price_min", label: "Min. Price (₹)", type: "number" },
    { name: "price_max", label: "Max. Price (₹)", type: "number" },
    { name: "age_min", label: "Min. Age", type: "number" }, // ✅ common age fields
    { name: "age_max", label: "Max. Age", type: "number" },
    { name: "availability", label: "Only Show Available", type: "checkbox" },
  ],
};


const SearchBarWithFilters = ({ userType, onFilter }) => {
  const filtersToRender = fieldOptions[userType] || [];
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const query = new URLSearchParams();
    if (userType) query.set("user_type", userType);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== false && value !== null) {
        query.set(key, value);
      }
    });

    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`/search/get_filtered_users/?${query.toString()}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      onFilter(data.filtered_users || []);
    } catch (err) {
      console.error("❌ Filter error:", err?.response?.data || err.message);
      alert(err?.response?.data?.detail || "Could not apply filters.");
    }
  };

  return (
    <Form onSubmit={handleSearch} className="mb-3">
      <Row className="search-input-stack d-flex flex-column flex-md-row position-relative">
        <Col xs={12} md={10}>
          <div className="d-flex position-relative">
            <Form.Control
              type="text"
              name={userType === "krisshak" ? "requirements" : "specialization"}
              value={filters[userType === "krisshak" ? "requirements" : "specialization"] || ""}
              onChange={handleChange}
              placeholder={`Search by ${userType === "krisshak" ? "Requirements..." : "Specialization..."}`}
              className="flex-grow-1 mb-2 mb-md-0 pe-md-5"
            />
            <Button
              variant="outline-secondary"
              size="sm"
              type="button"
              className="ms-md-2"
              title="Toggle filter options"
              aria-label="Filter"
              onClick={() => setShowFilters(prev => !prev)}
            >
              <i className="bi bi-funnel-fill" /> {/* Bootstrap icons or custom SVG */}
            </Button>
          </div>
        </Col>

        <Col xs={12} md={2}>
          <Button type="submit" variant="primary" className="w-100 mt-2 mt-md-0">
            <b><i>Search</i></b>
          </Button>
        </Col>
      </Row>

      {showFilters && (
        <div className="mt-3 p-3 border rounded bg-light"
          style={{
          maxHeight: "400px",
          overflowY: "auto",
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}>
          <Row className="gy-3 gx-3">
            {filtersToRender.map((filterField, i) => (
              <Col xs={12} sm={6} lg={4} key={i}>

                <Form.Group>
                  <Form.Label>{filterField.label}</Form.Label>
                  {filterField.type === "checkbox" ? (
                    <Form.Check
                      type="checkbox"
                      name={filterField.name}
                      label={filterField.label}
                      checked={filters[filterField.name] || false}
                      onChange={handleChange}
                    />
                  ) : (
                    <Form.Control
                      type={filterField.type}
                      name={filterField.name}
                      value={filters[filterField.name] || ""}
                      onChange={handleChange}
                      placeholder={filterField.placeholder || ""}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Form>

  );
};

export default SearchBarWithFilters;

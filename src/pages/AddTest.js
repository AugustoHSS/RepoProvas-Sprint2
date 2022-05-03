import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Autocomplete from '@mui/material/Autocomplete';
import Form from "../components/Form";
import api from "../services/api";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

function AddTest() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [testTitle, setTestTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [category, setCategory] = useState("");
  const [categoryOption, setCategoryOption] = useState([]);
  const [categoryInputValue, setCategoryInputValue] = useState('');
  const [discipline, setDiscipline] = useState("");
  const [disciplineOption, setDisciplineOption] = useState([]);
  const [disciplineInputValue, setDisciplineInputValue] = useState('');
  const [instructor, setInstructor] = useState("");
  const [instructorsOption, setInstructorOption] = useState([]);
  const [instructorInputValue, setInstructorInputValue] = useState('');


  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      const { data: categoriesData } = await api.getCategories(token);
      const { data: disciplinesData } = await api.getDisciplines(token);
      setCategoryOption(categoriesData.categories)
      setDisciplineOption(disciplinesData.disciplines)
    }
    loadPage();
  }, [token]);
  const categoriesOptions = categoryOption?.map((category, i) => {
    return {
      id: i,
      label: category.name
    };
  });

  const disciplineOptions = disciplineOption?.map((discipline, i) => {
    return {
      id: i,
      label: discipline.name
    };
  });

  async function getInstructors(discipline) {
    try {
      const { data: instructorsData } = await api.getInstructors(token, discipline);
      console.log(instructorsData.instructors)

      const instructorFiltered = instructorsData.instructors?.filter(instructor => instructor.teacherDisciplines?.length > 0);
      console.log(instructorFiltered)
      setInstructorOption(instructorFiltered)
    } catch (error) {
      console.log(error)
    }
  }

  const instructorsOptions = instructorsOption?.map((instructor) => {
    return {
      id: instructor.id,
      label: instructor.name
    };
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!testTitle || !pdfUrl || !category || !discipline || !instructor) {
      return alert("Existem campos vazios!");
    }

    const testData = {
      name: testTitle,
      pdfUrl: pdfUrl,
      categoryId: category.id + 1,
      disciplineId: discipline.id + 1,
      teacherId: instructor.id,
      views: 0,
    }
    console.log({ testData })
    try {
      await api.createTest(token, testData);

      setTestTitle('');
      setPdfUrl('');
      setCategory('');
      setDiscipline('');
      setInstructor('');

      alert('Prova adicionada!');
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Typography sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }} variant="h4" component="h1">
        Adicione uma prova
      </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <Form onSubmit={handleSubmit}>
          <TextField
            sx={{ width: '100%' }}
            id="outlined-basic"
            label="Titulo da prova"
            variant="outlined"
            type={'text'}
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
          />
          <TextField
            sx={{ width: '100%' }}
            id="outlined-basic"
            label="PDF da prova"
            variant="outlined"
            type={'text'}
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
          <Autocomplete
            fullWidth
            value={category}
            onChange={(event, newValue) => {
              setCategory(newValue);
            }}
            inputValue={categoryInputValue}
            onInputChange={(event, newInputValue) => {
              setCategoryInputValue(newInputValue);
            }}
            id="controllable-states-categories"
            options={categoriesOptions}
            isOptionEqualToValue={(category) => { return ({ id: category.id, label: category.name }) }}
            renderInput={(params) => <TextField {...params} label="Categoria" />}
          />
          <Autocomplete
            fullWidth
            value={discipline}
            onChange={(event, newValue) => {
              setDiscipline(newValue);
            }}
            inputValue={disciplineInputValue}
            onInputChange={(event, newInputValue) => {
              setDisciplineInputValue(newInputValue);
              getInstructors(newInputValue);
              setInstructorInputValue('');
            }}
            id="controllable-states-disciplines"
            options={disciplineOptions}
            isOptionEqualToValue={(discipline) => { return ({ id: discipline.id, label: discipline.name }) }}
            renderInput={(params) => <TextField {...params} label="Disciplina" />}
          />
          <Autocomplete
            fullWidth
            sx={{ pointerEvents: !discipline && 'none' }}
            value={instructor}
            onChange={(event, newValue) => {
              setInstructor(newValue);
            }}
            inputValue={instructorInputValue}
            onInputChange={(event, newInputValue) => {
              setInstructorInputValue(newInputValue);
            }}
            id="controllable-states-instructors"
            options={instructorsOptions}
            isOptionEqualToValue={(instructor) => { return ({ id: instructor.id, label: instructor.name }) }}
            renderInput={(params) => <TextField {...params} label="Pessoa Instrutora" />}
          />

          <Button
            fullWidth
            sx={{ marginTop: '10px' }}
            variant="contained"
            type="submit"
          >
            ENVIAR
          </Button>
        </Form>
      </Box>
    </>
  );
}


export default AddTest;
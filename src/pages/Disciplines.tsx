import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplineOption, setDisciplineOption] = useState<any>([]);
  const [discipline, setDiscipline] = useState(null);
  const [disciplineInputValue, setDisciplineInputValue] = useState('');

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
      const { data: disciplinesData } = await api.getDisciplines(token);
      setDisciplineOption(disciplinesData.disciplines)
    }
    loadPage();
  }, [token]);

  const disciplineOptions = disciplineOption?.map((discipline: any, i: any) => {
    return {
      id: i,
      label: discipline.name
    };
  });
  return (
    <>
      <Autocomplete
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        value={discipline}
        onChange={(event, newValue: any) => {
          setDiscipline(newValue);
        }}
        inputValue={disciplineInputValue}
        onInputChange={(event, newInputValue) => {
          setDisciplineInputValue(newInputValue);
        }}
        id="controllable-states-disciplines"
        options={disciplineOptions}
        renderInput={(params) => <TextField {...params} label="Disciplina" />}
      />
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
            variant="contained"
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
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} search={discipline} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
  search: any;
}

function TermsAccordions({ categories, terms, search }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
              search={search}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
  search: any;
}

function DisciplinesAccordions({
  categories,
  disciplines,
  search,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse período...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => {
        if (search === null) {
          return (
            <Accordion
              sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
              key={discipline.id}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{discipline.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Categories
                  categories={categories}
                  teachersDisciplines={discipline.teacherDisciplines}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
        if (discipline.name === search.label) {
          return (
            <Accordion
              sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
              key={discipline.id}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{discipline.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Categories
                  categories={categories}
                  teachersDisciplines={discipline.teacherDisciplines}
                />
              </AccordionDetails>
            </Accordion>
          )
        } else {
          return ""
        }
      }
      )}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
}

function Categories({ categories, teachersDisciplines }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests categoryId={categoryId} testsWithTeachers={testsWithDisciplines} />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
}

async function addView(test: any) {
  await api.addView(test.id)
}

function Tests({
  categoryId,
  testsWithTeachers: testsWithDisciplines,
}: TestsProps) {
  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => (
            <Typography key={test.id} color="#878787" >
              <Link
                onClick={() => addView(test)}
                href={test.pdfUrl}
                target="_blank"
                underline="none"
                color="inherit"
              >{`${test.name} (${testsWithDisciplines.teacherName}) `}</Link>
              <span> {test.views} visualizações</span>
            </Typography>
          ))
      )}
    </>
  );
}

export default Disciplines;

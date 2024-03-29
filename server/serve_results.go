package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Server) GetResults() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		// get the analysis
		user := s.getSessionUser(w, r)
		if user == nil {
			return
		}
		id := mux.Vars(r)["id"]
		data, err := s.db.Get(AnalysisBucket, id)
		if err != nil {
			SendError(w, "failed to get analysis id="+id, err)
			return
		}
		analysis, err := ParseEntity(data, AnalysisFn)
		if err != nil {
			SendError(w, "failed to parse analysis id="+id, err)
			return
		}
		if analysis.UserID() != user.ID {
			http.Error(w, "not allowed", http.StatusUnauthorized)
			return
		}

		// fetch processes
		processes := make(map[string]*Process)
		err = s.db.Each(ProcessBucket, func(key string, data []byte) error {
			p, err := ParseEntity(data, ProcessFn)
			if err != nil {
				return err
			}
			processes[LowerTrim(p.Name)] = p
			return nil
		})
		if err != nil {
			SendError(w, "failed to load processes", err)
			return
		}

		// construct the result
		res := Result{
			Analysis: analysis,
		}
		for i := range analysis.Scenarios {
			s := analysis.Scenarios[i]
			waste := WasteResult{Scenario: s.Name}
			emission := EmissionResult{Scenario: s.Name}
			for step := range s.Steps {
				addResults(&s.Steps[step], &waste, &emission, processes)
			}
			res.WasteResults = append(res.WasteResults, waste)
			res.EmissionResults = append(res.EmissionResults, emission)
		}
		SendAsJson(w, &res)
	}
}

func addResults(
	step *ScenarioStep,
	waste *WasteResult,
	emission *EmissionResult,
	processes map[string]*Process,
) {

	process := processes[LowerTrim(step.Process)]
	for _, f := range step.Fractions {
		mass := f.Component.Mass * f.Value / 100.0
		switch f.State {
		case DisposedState:
			waste.AmountDisposed += mass
		case RecycledState:
			waste.AmountRecycled += mass
		case ReusedState:
			waste.AmountReused += mass
		}
		if process != nil {
			emission.Value += mass * process.EmissionFactor / 1000
		}
	}

	for i := range step.Steps {
		addResults(&step.Steps[i], waste, emission, processes)
	}
}

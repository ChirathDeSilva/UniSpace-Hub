package com.uniSpaceHub.demo.mapper.Ticket;

import org.springframework.stereotype.Component;

import com.uniSpaceHub.demo.dto.ticket.CreateTicketRequest;
import com.uniSpaceHub.demo.dto.ticket.UpdateTicketRequest;
import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.Ticket.Ticket;

@Component
public class TicketMapper {

    public Ticket toEntity(CreateTicketRequest request) {
        Ticket ticket = new Ticket();
        User createdBy = new User();
        Facility facility = new Facility() {
        };

        createdBy.setId(request.getCreatedByUserId());
        ticket.setCreatedBy(createdBy);
        if (request.getFacilityId() != null) {
            facility.setId(request.getFacilityId());
            ticket.setFacility(facility);
        }
        applyUpdatableFields(ticket, request.getTitle(), request.getDescription(), request.getCategory(),
                request.getPriority(), request.getLocation(), request.getContactDetails());

        return ticket;
    }

    public Ticket toEntity(UpdateTicketRequest request) {
        Ticket ticket = new Ticket();
        if (request.getFacilityId() != null) {
            Facility facility = new Facility() {
            };
            facility.setId(request.getFacilityId());
            ticket.setFacility(facility);
        }
        applyUpdatableFields(ticket, request.getTitle(), request.getDescription(), request.getCategory(),
                request.getPriority(), request.getLocation(), request.getContactDetails());
        return ticket;
    }

    private void applyUpdatableFields(
            Ticket ticket,
            String title,
            String description,
            com.uniSpaceHub.demo.model.Ticket.TicketCategory category,
            com.uniSpaceHub.demo.model.Ticket.TicketPriority priority,
            String location,
            String contactDetails) {
        ticket.setTitle(title);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setLocation(location);
        ticket.setContactDetails(contactDetails);
    }
}
